/**
 * Filters empty values from an array
 * @param {Array} arr - Array to filter
 * @returns {Array} Filtered array
 */
function filterEmptyArray(arr) {
  return arr.filter(item => {
    if (item == null) return false;
    if (typeof item === 'object' && Object.keys(item).length === 0) return false;
    return true;
  });
}

/**
 * Filters empty values from an object
 * @param {Object} obj - Object to filter
 * @returns {Object} Filtered object
 */
function filterEmptyObject(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];
    if (value != null && value !== '') {
      result[key] = value;
    }
    return result;
  }, {});
}

/**
 * Creates metadata for export
 * @param {*} data - Exported data
 * @returns {Object} Metadata object
 */
function createMetadata(data) {
  return {
    exportedAt: new Date().toISOString(),
    recordCount: Array.isArray(data) ? data.length : 1,
    format: 'json'
  };
}

/**
 * Exports data to JSON format with various options
 * @param {*} data - Data to export
 * @param {Object} options - Export options
 * @returns {string} JSON string
 */
function exportToJson(data, options = {}) {
  if (data == null) {
    throw new Error('Data is required for export');
  }

  const { pretty = true, includeMetadata = false, filterEmpty = false } = options;
  let processedData = data;

  if (filterEmpty) {
    if (Array.isArray(data)) {
      processedData = filterEmptyArray(data);
    } else if (typeof data === 'object') {
      processedData = filterEmptyObject(data);
    }
  }

  const output = { data: processedData };

  if (includeMetadata) {
    output.metadata = createMetadata(processedData);
  }

  return JSON.stringify(output, null, pretty ? 2 : 0);
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
