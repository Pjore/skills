# macOS Document Notes

## Extract Without Installing

- Read DOCX text with `textutil -convert txt -stdout DOCUMENT.docx`.
- Inspect relevant XML with `unzip -p DOCUMENT.docx word/document.xml | xmllint --xpath 'XPATH' -`.
- Use the bundled PDF inspector for page boundaries. If `pdftotext` is absent, use PDFKit instead of installing another stack just to extract text.
- Read a source PDF with `swift -e 'import PDFKit; import Foundation; let document = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!; for index in 0..<document.pageCount { print("PAGE \(index + 1)"); print(document.page(at: index)?.string ?? "[no text]") }' SOURCE.pdf`. Narrow subsequent reads to affected pages. Image-only PDFs need OCR, not repeated extraction.

## Create DOCX From HTML

- Use `textutil -convert docx -format html -stdin -output OUTPUT.docx` for simple text-heavy documents. Prefer existing templates; do not treat CSS as proof of Word formatting.
- In one observed conversion, CSS `10pt` became Word 13pt, while `10px` produced Word 10pt. Verify actual `w:sz` values: Word stores half-points, so `20` means 10pt. Treat this as a converter quirk, not a universal CSS rule.
- Use one paragraph per signature group with `<br>` between signature, name and date. Separate paragraphs introduce unwanted spacing.
- Add true Word page breaks with `w:pPr/w:pageBreakBefore`; do not rely on HTML `page-break-before` surviving conversion.

## Fail Fast

- Prefer Pandoc plus Typst for simple FOSS PDF re-typesetting. Do not claim it preserves arbitrary tables, images, fields, headers, footnotes or exact Word pagination. Inspect complex documents and choose an appropriate renderer.
- If Word automation reports no open document and one narrow retry fails, change routes or report the blocker; do not repeat AppleScript variations indefinitely.
- `sdef` may require full Xcode. If Word's dictionary is needed, read `/Applications/Microsoft Word.app/Contents/Resources/Word.sdef` directly with an XML tool.
- Check availability once; use `grep` or PDFKit if `rg` or `pdftotext` is absent.
- If macOS system Ruby loads incompatible user gems, use `env -u GEM_HOME -u GEM_PATH /usr/bin/ruby` for the DOCX helper. Do not disable gems when REXML is needed.
- Use `env -u GEM_HOME -u GEM_PATH /usr/bin/ruby --disable-gems -ryaml -rdate` for simple YAML checks. On Ruby 2.6, pass permitted classes as the second positional argument to `YAML.safe_load`.