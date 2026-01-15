/**
 * Exports data to JSON format with various options
 */

function exportToJson(data, options = {}) {
  if (data === null || data === undefined) {
    throw new Error('Data is required for export');
  }

  const pretty = options.pretty !== false;
  const includeMetadata = options.includeMetadata || false;
  const filterEmpty = options.filterEmpty || false;

  let processedData = data;

  if (filterEmpty && Array.isArray(data)) {
    processedData = data.filter(item => {
      if (item === null || item === undefined) return false;
      if (typeof item === 'object' && Object.keys(item).length === 0) return false;
      return true;
    });
  }

  if (filterEmpty && typeof data === 'object' && !Array.isArray(data)) {
    processedData = {};
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        processedData[key] = data[key];
      }
    }
  }

  const output = {
    data: processedData
  };

  if (includeMetadata) {
    output.metadata = {
      exportedAt: new Date().toISOString(),
      recordCount: Array.isArray(processedData) ? processedData.length : 1,
      format: 'json'
    };
  }

  if (pretty) {
    return JSON.stringify(output, null, 2);
  }

  return JSON.stringify(output);
}

function exportToJsonLines(data) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array for JSON Lines export');
  }

  return data.map(item => JSON.stringify(item)).join('\n');
}

function parseJsonSafely(jsonString) {
  if (typeof jsonString !== 'string') {
    throw new Error('Input must be a string');
  }

  try {
    return { success: true, data: JSON.parse(jsonString) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  exportToJson,
  exportToJsonLines,
  parseJsonSafely
};
