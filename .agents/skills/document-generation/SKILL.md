---
name: document-generation
description: 'Create, adapt, edit, rename and validate Word documents, PDFs and Excel workbooks with minimal tool calls. Use for DOCX placeholders, spreadsheet generation, contract variants, compact signature blocks, font-size corrections, PDF conversion, page breaks and document finalization. Includes formatting-preserving DOCX edits and FOSS Pandoc/Typst export; macOS inspection helpers.'
---

# Document Generation

## Route Once

1. Start with the supplied document and requested fields or layout change. Inspect only affected paragraphs or page boundaries; do not repeatedly dump whole documents.
2. Separate content edits from rendering edits. Patch existing DOCX XML for text or Word page breaks; use the PDF pipeline for PDF-only pagination. Never rebuild a finalized DOCX to replace a few fields.
3. Confirm missing legal terms, parties, scope and output format once. Do not infer legal details, signing dates from agreement dates, or material changes in meaning. Leave explicit placeholders when authorized.
4. Reuse the helpers below without loading their source. Check required commands once; prefer an available toolchain. Do not install speculative alternatives.

## Edit DOCX

Run `ruby scripts/patch-docx.rb SOURCE.docx OUTPUT.docx PLAN.json` from this skill directory. Choose a new output path; the helper refuses overwrites.

Supply a JSON plan with any of these keys:

- `replacements`: map exact existing text to replacement text; require exactly one occurrence per key.
- `page_break_before`: list exact paragraph labels that must begin a new page.
- `remove_page_break_before`: list labels whose explicit Word break must be removed.

Use structured XML, not ZIP-wide substitution. The helper preserves other archive entries and run formatting, rejects signed documents, and fails if replacement text spans runs. If it fails, inspect only the affected runs and perform a deliberate run-aware edit; never flatten the document.

Keep sources until validation passes. Rename only when requested, refuse collisions, and update known local references if in scope. Never edit signed originals. Keep personal details in task inputs, not reusable resources or memory.

## Export PDF

Require `pandoc` and `typst`; install with `brew install pandoc typst` on macOS only when needed and authorized. They are FOSS but re-typeset DOCX; do not promise Word-identical layout. Use a native renderer when exact Word layout is required.

Run `bash scripts/export-pdf.sh SOURCE.docx OUTPUT.pdf '4. Exceptions' '8. General'`. Each trailing argument adds a break before that exact heading; omit arguments for natural flow. Set `DOC_FONT` to an installed font if Arial is unavailable.

- Preserve compact signature groups as one paragraph per party with internal line breaks.
- Do not add a signature-page break unless requested. Removing it lets signatures follow the preceding section.
- Treat the heading list as the complete PDF break policy. Pandoc can drop Word page-break properties.
- Keep the template, break list and build command beside long-lived deliverables when reproducible builds are requested. Never depend on a previous session's `/tmp` files.

## Spreadsheets

For JSON-to-Excel tasks, follow [spreadsheet generation](./references/spreadsheet-generation.md) and use `scripts/json-to-xlsx.cjs` when its tabular format fits. For HEIC source images, see the separate [HEIC intake notes](./references/heic-image-intake.md).

## Validate And Stop

On macOS, run `swift scripts/inspect-pdf.swift OUTPUT.pdf [CHECKS.json]`. It prints page count and the first line per page, not full text. Optional JSON keys: `pages` (integer), `contains` (text list), `starts` (page-number-to-heading map), `page_contains` (page-number-to-text-list map), `render` (page-number-to-PNG-path map). Pages are one-based.

1. After DOCX edits, check archive/XML, replacements and relevant formatting. The edit helper verifies its planned XML edit and archive integrity.
2. After PDF export, assert required text, page count and heading starts. Inspect affected rendered pages after layout changes; XML cannot prove pagination.
3. If a requested page number conflicts with actual flow, report the observed number and clarify intent. Do not insert blank pages, shrink fonts or drop content silently.
4. Batch independent checks for variants. Repair the same slice and rerun the same check if it fails; stop when the requested checks pass.
5. Return final file links and remaining fields or unverified requirements. State which formats changed; PDF-only breaks do not update DOCX.

Read [macOS notes](./references/macos.md) only for text extraction, HTML-to-DOCX creation, unit conversion or tool failures.