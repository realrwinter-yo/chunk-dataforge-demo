/**
 * Converts CSV string to JSON array
 * @param {string} csv - The CSV string to convert
 * @param {Object} options - Conversion options
 * @returns {Array} Array of objects
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
