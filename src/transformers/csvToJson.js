/**
 * Converts a CSV string into an array of plain objects.
 *
 * The first line of the CSV is treated as the header row and becomes the
 * keys of each resulting object. Subsequent lines are data rows. Blank
 * lines are skipped. All keys and values are trimmed of surrounding
 * whitespace. All values are returned as strings — callers must coerce
 * to numbers, booleans, or other types as needed.
 *
 * Does not currently support quoted fields that span multiple lines or
 * that contain the delimiter character.
 *
 * @param {string} csv - The CSV string to parse. Must be a non-null string.
 * @param {Object} [options={}] - Optional parsing options.
 * @param {string} [options.delimiter=','] - Character used to separate fields.
 *   Override this for TSV or other delimited formats (e.g. `'\t'`).
 * @returns {Object[]} Array of objects, one per data row. Returns `[]` for
 *   empty input or a header-only CSV.
 * @throws {Error} If `csv` is `null`, `undefined`, or not a string.
 *
 * @example
 * csvToJson('name,age\nAlice,30\nBob,25');
 * // [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]
 *
 * csvToJson('a\tb\tc\n1\t2\t3', { delimiter: '\t' });
 * // [{ a: '1', b: '2', c: '3' }]
 *
 * csvToJson('');
 * // []
 */
function csvToJson(csv, options = {}) {
  if (csv === null || csv === undefined) {
    throw new Error('CSV input is required');
  }

  if (typeof csv !== 'string') {
    throw new Error('CSV input must be a string');
  }

  const delimiter = options.delimiter || ',';

  const trimmedCsv = csv.trim();
  if (trimmedCsv.length === 0) {
    return [];
  }

  const lines = trimmedCsv.split('\n');

  if (lines.length === 0) {
    return [];
  }

  // Parse headers
  const headers = lines[0].split(delimiter).map(h => h.trim());

  if (lines.length === 1) {
    return [];
  }

  // Parse data rows
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) {
      continue;
    }

    const values = line.split(delimiter);
    const obj = {};

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = values[j] !== undefined ? values[j].trim() : '';
      obj[header] = value;
    }

    result.push(obj);
  }

  return result;
}

module.exports = { csvToJson };
