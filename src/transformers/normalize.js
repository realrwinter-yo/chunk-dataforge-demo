/**
 * Normalizes a string value by trimming and normalizing whitespace
 * @param {string} str - String to normalize
 * @param {string} key - Property key for case transformation
 * @param {Array<string>} lowercase - Keys to lowercase
 * @param {Array<string>} uppercase - Keys to uppercase
 * @returns {string} Normalized string
 */
function normalizeString(str, key, lowercase, uppercase) {
  let normalized = str.trim().replace(/\s+/g, ' ');

  if (lowercase.includes(key)) {
    normalized = normalized.toLowerCase();
  }
  if (uppercase.includes(key)) {
    normalized = normalized.toUpperCase();
  }

  return normalized;
}

/**
 * Creates nested options for recursive normalization
 * @param {string} key - Parent key
 * @param {Array<string>} lowercase - Lowercase fields
 * @param {Array<string>} uppercase - Uppercase fields
 * @returns {Object} Nested options
 */
function createNestedOptions(key, lowercase, uppercase) {
  const prefix = key + '.';
  return {
    lowercase: lowercase.filter(f => f.startsWith(prefix)).map(f => f.substring(prefix.length)),
    uppercase: uppercase.filter(f => f.startsWith(prefix)).map(f => f.substring(prefix.length))
  };
}

/**
 * Normalizes data by trimming strings and applying case transformations
 * @param {*} data - The data to normalize
 * @param {Object} options - Normalization options
 * @returns {*} Normalized data
 */
function normalizeData(data, options = {}) {
  if (data == null) {
    return data;
  }

  const { lowercase = [], uppercase = [] } = options;

  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item, options));
  }

  if (typeof data === 'object') {
    return Object.keys(data).reduce((result, key) => {
      let value = data[key];

      if (typeof value === 'object' && value !== null) {
        const nestedOptions = createNestedOptions(key, lowercase, uppercase);
        value = normalizeData(value, nestedOptions);
      } else if (typeof value === 'string') {
        value = normalizeString(value, key, lowercase, uppercase);
      }

      result[key] = value;
      return result;
    }, {});
  }

  return data;
}

module.exports = { normalizeData };
