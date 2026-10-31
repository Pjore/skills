require 'json'
require 'rexml/document'
require 'rexml/xpath'
require 'open3'
require 'tmpdir'
require 'fileutils'

abort 'Usage: ruby patch-docx.rb SOURCE.docx OUTPUT.docx PLAN.json' unless ARGV.length == 3
source, destination, plan_path = ARGV.map { |path| File.expand_path(path) }
abort 'Output already exists; choose a new path' if File.exist?(destination)
plan = JSON.parse(File.read(plan_path))
unknown = plan.keys - %w[replacements page_break_before remove_page_break_before]
abort "Unknown plan keys: #{unknown.join(', ')}" unless unknown.empty?
namespace = { 'w' => 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' }
entries, listing_status = Open3.capture2('unzip', '-Z1', source)
abort 'Cannot read DOCX archive' unless listing_status.success?
abort 'Refusing to edit a digitally signed document' if entries.lines.any? { |entry| entry.start_with?('_xmlsignatures/') }
xml, extraction_status = Open3.capture2('unzip', '-p', source, 'word/document.xml')
abort 'Missing document XML' unless extraction_status.success?
document = REXML::Document.new(xml)
text_nodes = REXML::XPath.match(document, '//w:t', namespace)
(plan['replacements'] || {}).each do |existing, replacement|
  abort 'Replacement keys must be nonempty strings and values must be strings' unless existing.is_a?(String) && !existing.empty? && replacement.is_a?(String)
  occurrences = text_nodes.sum { |node| node.text.to_s.scan(Regexp.new(Regexp.escape(existing))).length }
  abort 'Expected one occurrence inside a single text run; inspect the affected XML' unless occurrences == 1
  node = text_nodes.find { |candidate| candidate.text.to_s.include?(existing) }
  node.text = node.text.sub(existing) { replacement }
end
paragraphs = REXML::XPath.match(document, '//w:p', namespace)
%w[page_break_before remove_page_break_before].each do |operation|
  (plan[operation] || []).each do |label|
    matches = paragraphs.select do |paragraph|
      REXML::XPath.match(paragraph, './/w:t', namespace).map { |node| node.text.to_s }.join == label
    end
    abort 'Expected exactly one matching paragraph for a page-break change' unless matches.length == 1
    paragraph = matches.first
    properties = paragraph.elements['w:pPr']
    if operation == 'remove_page_break_before'
      properties.delete_element('w:pageBreakBefore') if properties
      next
    end
    unless properties
      properties = REXML::Element.new('w:pPr')
      paragraph.insert_before(paragraph.elements[1], properties)
    end
    page_break = properties.elements['w:pageBreakBefore']
    if page_break
      page_break.attributes.delete('w:val')
    else
      page_break = REXML::Element.new('w:pageBreakBefore')
      following = properties.elements.find { |element| !%w[pStyle keepNext keepLines].include?(element.name) }
      following ? properties.insert_before(following, page_break) : properties.add_element(page_break)
    end
  end
end
Dir.mktmpdir('patch-docx-') do |temporary_directory|
  staged = File.join(temporary_directory, 'output.docx')
  FileUtils.cp(source, staged)
  FileUtils.mkdir_p(File.join(temporary_directory, 'word'))
  File.open(File.join(temporary_directory, 'word', 'document.xml'), 'w') { |output| document.write(output) }
  Dir.chdir(temporary_directory) do
    abort 'Cannot update DOCX' unless system('zip', '-q', staged, 'word/document.xml')
  end
  _, archive_status = Open3.capture2('unzip', '-t', staged)
  abort 'DOCX integrity check failed' unless archive_status.success?
  saved_xml, saved_status = Open3.capture2('unzip', '-p', staged, 'word/document.xml')
  abort 'Cannot verify saved XML' unless saved_status.success?
  abort 'Saved XML does not match the planned edit' unless REXML::Document.new(saved_xml).to_s == document.to_s
  FileUtils.cp(staged, destination)
end
puts "PASS: #{File.basename(destination)}: DOCX integrity and planned XML edit verified"