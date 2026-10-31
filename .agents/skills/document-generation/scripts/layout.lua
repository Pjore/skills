local page_breaks = {}
for label in ((os.getenv('DOC_PAGE_BREAKS') or '') .. '\n'):gmatch('([^\n]+)\n') do
  page_breaks[label] = true
end

function Pandoc(document)
  local blocks = pandoc.List()
  local matched_breaks = {}
  for index, block in ipairs(document.blocks) do
    local label = pandoc.utils.stringify(block)
    if block.t == 'Para' and #block.content == 1 and block.content[1].t == 'Strong' then
      if index == 1 or label == 'Between' or label == 'Signatures' or label:match('^%d+%. ') or page_breaks[label] then
        block = pandoc.Header(index == 1 and 1 or 2, block.content[1].content)
      end
    end
    if page_breaks[label] then
      blocks:insert(pandoc.RawBlock('typst', '#pagebreak()'))
      matched_breaks[label] = (matched_breaks[label] or 0) + 1
    end
    blocks:insert(block)
  end
  for label in pairs(page_breaks) do
    if matched_breaks[label] ~= 1 then
      error('Expected exactly one page-break heading: ' .. label)
    end
  end
  document.blocks = blocks
  return document
end