#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

try {
  require.resolve('exceljs');
} catch {
  console.error('ExcelJS is required. Install it with npm, then run this script with its node_modules on NODE_PATH.');
  process.exit(1);
}
const ExcelJS = require('exceljs');

const validSheetName = name => typeof name === 'string' && name.trim() && name.length <= 31 && !/[\\/?*:[\]]/.test(name);
const isCellValue = value => value === null || typeof value === 'string' || typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value));

function parseArguments() {
  if (process.argv.length !== 4) {
    throw new Error('Usage: node json-to-xlsx.cjs INPUT.json OUTPUT.xlsx');
  }
  const [input, output] = process.argv.slice(2).map(file => path.resolve(file));
  if (!fs.existsSync(input) || !fs.statSync(input).isFile()) throw new Error('Input must be an existing JSON file.');
  if (!output.toLowerCase().endsWith('.xlsx')) throw new Error('Output must use the .xlsx extension.');
  if (fs.existsSync(output)) throw new Error('Output already exists; choose a new path.');
  return { input, output };
}

function normalizeWorkbook(data) {
  if (!data || !Array.isArray(data.sheets) || data.sheets.length === 0) {
    throw new Error('Input must include at least one sheet.');
  }
  const names = new Set();
  const sheets = data.sheets.map((sheet, sheetIndex) => {
    if (!sheet || !validSheetName(sheet.name)) {
      throw new Error(`Sheet ${sheetIndex + 1} needs a valid name (1-31 characters; cannot contain \\ / ? * : [ ]).`);
    }
    if (names.has(sheet.name.toLowerCase())) throw new Error(`Duplicate sheet name: ${sheet.name}.`);
    names.add(sheet.name.toLowerCase());
    if (!Array.isArray(sheet.columns) || sheet.columns.length === 0) {
      throw new Error(`Sheet ${sheet.name} must include at least one column.`);
    }
    const keys = new Set();
    const columns = sheet.columns.map((column, columnIndex) => {
      if (!column || typeof column.header !== 'string' || !column.header.trim() ||
          typeof column.key !== 'string' || !column.key.trim()) {
        throw new Error(`Sheet ${sheet.name}, column ${columnIndex + 1} needs a header and key.`);
      }
      if (keys.has(column.key)) throw new Error(`Duplicate column key in ${sheet.name}: ${column.key}.`);
      keys.add(column.key);
      if (column.width !== undefined && (!Number.isFinite(column.width) || column.width < 1 || column.width > 255)) {
        throw new Error(`Invalid width for ${sheet.name}.${column.key}; use a number from 1 to 255.`);
      }
      if (column.numFmt !== undefined && typeof column.numFmt !== 'string') {
        throw new Error(`Invalid number format for ${sheet.name}.${column.key}.`);
      }
      return { header: column.header, key: column.key, width: column.width, numFmt: column.numFmt };
    });
    if (!Array.isArray(sheet.rows)) throw new Error(`Sheet ${sheet.name} must include a rows array.`);
    const rows = sheet.rows.map((row, rowIndex) => {
      if (!row || Array.isArray(row) || typeof row !== 'object') {
        throw new Error(`Row ${rowIndex + 1} in ${sheet.name} must be an object keyed by column.`);
      }
      for (const [key, value] of Object.entries(row)) {
        if (!keys.has(key)) throw new Error(`Unknown column key in ${sheet.name}, row ${rowIndex + 1}: ${key}.`);
        if (!isCellValue(value)) throw new Error(`Unsupported value in ${sheet.name}.${key}, row ${rowIndex + 1}.`);
      }
      return row;
    });
    const freezeRows = sheet.freezeRows ?? 1;
    if (!Number.isInteger(freezeRows) || freezeRows < 0 || freezeRows > rows.length + 1) {
      throw new Error(`Invalid freezeRows setting for ${sheet.name}.`);
    }
    const autoFilter = sheet.autoFilter ?? true;
    if (typeof autoFilter !== 'boolean') throw new Error(`autoFilter for ${sheet.name} must be a boolean.`);
    const orientation = sheet.orientation ?? (columns.length > 5 ? 'landscape' : 'portrait');
    if (!['portrait', 'landscape'].includes(orientation)) {
      throw new Error(`Orientation for ${sheet.name} must be portrait or landscape.`);
    }
    return { name: sheet.name, columns, rows, freezeRows, autoFilter, orientation };
  });
  return { sheets };
}

function addSheet(workbook, definition) {
  const sheet = workbook.addWorksheet(definition.name);
  sheet.columns = definition.columns.map(column => ({
    header: column.header,
    key: column.key,
    width: column.width ?? 18,
    style: column.numFmt ? { numFmt: column.numFmt } : undefined,
  }));
  sheet.addRows(definition.rows);
  const header = sheet.getRow(1);
  header.height = 24;
  header.font = { bold: true };
  header.alignment = { vertical: 'middle', wrapText: true };
  header.eachCell({ includeEmpty: true }, cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
  });
  sheet.views = [{
    state: definition.freezeRows ? 'frozen' : 'normal',
    ySplit: definition.freezeRows,
    showGridLines: false,
  }];
  if (definition.autoFilter && definition.rows.length) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: definition.rows.length + 1, column: definition.columns.length },
    };
  }
  sheet.pageSetup = {
    paperSize: 9,
    orientation: definition.orientation,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
  };
  return sheet;
}

async function main() {
  const { input, output } = parseArguments();
  const definitions = normalizeWorkbook(JSON.parse(fs.readFileSync(input, 'utf8')));
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Document Generation Skill';
  for (const definition of definitions.sheets) addSheet(workbook, definition);

  await workbook.xlsx.writeFile(output);
  const checked = new ExcelJS.Workbook();
  await checked.xlsx.readFile(output);
  assert.deepEqual(checked.worksheets.map(sheet => sheet.name), definitions.sheets.map(sheet => sheet.name));
  for (const definition of definitions.sheets) {
    const sheet = checked.getWorksheet(definition.name);
    definition.columns.forEach((column, index) => {
      assert.equal(sheet.getCell(1, index + 1).value, column.header);
      if (column.width !== undefined) assert.equal(sheet.getColumn(index + 1).width, column.width);
      if (column.numFmt !== undefined) assert.equal(sheet.getColumn(index + 1).numFmt, column.numFmt);
    });
    definition.rows.forEach((row, rowIndex) => {
      definition.columns.forEach((column, columnIndex) => {
        const expected = row[column.key] ?? null;
        const cell = sheet.getCell(rowIndex + 2, columnIndex + 1);
        assert.deepEqual(cell.value, expected);
        if (typeof expected === 'string') assert.equal(cell.type, ExcelJS.ValueType.String);
      });
    });
    assert.equal(sheet.views[0].ySplit ?? 0, definition.freezeRows);
    assert.equal(Boolean(sheet.autoFilter), definition.autoFilter && definition.rows.length > 0);
    assert.equal(sheet.pageSetup.orientation, definition.orientation);
    assert.equal(sheet.pageSetup.fitToWidth, 1);
  }
  console.log(`Created and validated ${output} (${definitions.sheets.length} sheets).`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});