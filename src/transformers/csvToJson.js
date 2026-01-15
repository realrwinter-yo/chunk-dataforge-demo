/**
 * Parses a CSV row into an object using headers
 * @param {string} row - CSV row
 * @param {Array<string>} headers - Column headers
 * @param {string} delimiter - Column delimiter
 * @returns {Object} Parsed object
 */
function parseRow(row, headers, delimiter) {
  const values = row.split(delimiter);
  return headers.reduce((obj, header, index) => {
    obj[header] = values[index] !== undefined ? values[index].trim() : '';
    return obj;
  }, {});
}

/**
 * Converts CSV string to JSON array
 * @param {string} csv - The CSV string to convert
 * @param {Object} options - Conversion options
 * @returns {Array} Array of objects
 */
function csvToJson(csv, options = {}) {
  if (csv == null) {
    throw new Error('CSV input is required');
  }

  if (typeof csv !== 'string') {
    throw new Error('CSV input must be a string');
  }

  const trimmedCsv = csv.trim();
  if (trimmedCsv.length === 0) {
    return [];
  }

  const { delimiter = ',' } = options;
  const lines = trimmedCsv.split('\n');

  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(delimiter).map(h => h.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 0) {
      result.push(parseRow(line, headers, delimiter));
    }
  }

  return result;
}

module.exports = { csvToJson };
