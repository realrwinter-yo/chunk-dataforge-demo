/**
 * Normalizes data by trimming strings and applying case transformations
 * @param {*} data - The data to normalize
 * @param {Object} options - Normalization options
 * @returns {*} Normalized data
 */
function normalizeData(data, options = {}) {
  if (data === null) {
    return null;
  }

  if (data === undefined) {
    return undefined;
  }

  const lowercase = options.lowercase || [];
  const uppercase = options.uppercase || [];

  // Handle arrays
  if (Array.isArray(data)) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result.push(normalizeData(data[i], options));
    }
    return result;
  }

  // Handle objects
  if (typeof data === 'object') {
    const result = {};
    const keys = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let value = data[key];

      // Recursively normalize nested objects
      if (typeof value === 'object' && value !== null) {
        // Pass nested options
        const nestedOptions = {
          lowercase: lowercase.filter(f => f.startsWith(key + '.')).map(f => f.substring(key.length + 1)),
          uppercase: uppercase.filter(f => f.startsWith(key + '.')).map(f => f.substring(key.length + 1))
        };
        value = normalizeData(value, nestedOptions);
      } else if (typeof value === 'string') {
        // Trim and normalize whitespace
        value = value.trim().replace(/\s+/g, ' ');

        // Apply case transformations
        if (lowercase.includes(key)) {
          value = value.toLowerCase();
        }
        if (uppercase.includes(key)) {
          value = value.toUpperCase();
        }
      }

      result[key] = value;
    }

    return result;
  }

  // Return primitives as-is
  return data;
}

module.exports = { normalizeData };
