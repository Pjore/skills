# Spreadsheet Generation

## Choose The Structure

- Start from the requested use: a data table, tracker, report, schedule, or printable worksheet. Keep one record per row and one field per column unless the source layout has meaningful groups.
- Preserve source values and ordering. Do not guess missing values, coerce ambiguous text into dates or numbers, or add derived columns without a clear request.
- Use separate sheets for distinct views or purposes. Keep source/transcribed data distinct from calculated or summarized data.
- For image sources, transcribe and count records before generation; image interpretation requires visual review. HEIC conversion and preview steps are in [HEIC image intake](./heic-image-intake.md).

## Generate From JSON

The helper accepts a workbook with named sheets, keyed columns, and row objects. Column keys map row fields to output columns. Optional settings are `width`, `numFmt`, `freezeRows`, `autoFilter`, and `orientation`:

```json
{
  "sheets": [
    {
      "name": "Expenses",
      "columns": [
        { "header": "Date", "key": "date", "width": 14, "numFmt": "yyyy-mm-dd" },
        { "header": "Category", "key": "category" },
        { "header": "Amount", "key": "amount", "numFmt": "0.00" }
      ],
      "rows": [
        { "date": "2026-10-31", "category": "Travel", "amount": 125.5 }
      ],
      "freezeRows": 1,
      "autoFilter": true,
      "orientation": "landscape"
    }
  ]
}
```

Install ExcelJS only when needed; for one-off work, keep dependencies outside the vault:

```sh
npm install --prefix /tmp/document-generation-excel --no-audit --no-fund exceljs
NODE_PATH=/tmp/document-generation-excel/node_modules node scripts/json-to-xlsx.cjs INPUT.json OUTPUT.xlsx
```

The helper refuses to overwrite output. JSON strings, including strings beginning with `=`, remain literal text; formulas are not inferred or evaluated. Use an explicit, reviewed formula workflow when calculations are required.

## Validate

- Compare the generated workbook against the requested fields, sheet names, row order, and any source transcription.
- The helper reopens its output and checks sheet structure, values, column settings, and view/print options.
- Open or render the workbook when visual fidelity matters. Successful serialization cannot prove layout in Excel or Numbers.
- Large datasets should remain paginated vertically; the helper fits sheet width for printing but does not force all rows onto one page.