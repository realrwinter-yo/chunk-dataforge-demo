/**
 * Recursively normalises data by trimming strings and applying optional
 * case transformations to named fields.
 *
 * - **Strings** — trimmed and internal runs of whitespace collapsed to a
 *   single space, then optionally lower- or upper-cased based on `options`.
 * - **Arrays** — each element is normalised recursively with the same options.
 * - **Objects** — each value is normalised recursively; for nested objects the
 *   relevant field names must be dot-prefixed in `options.lowercase` /
 *   `options.uppercase` (e.g. `"address.city"`).
 * - **Primitives** (`null`, `undefined`, numbers, booleans) — returned as-is.
 *
 * The function does **not** mutate the original data; it returns a new
 * structure with the same shape.
 *
 * @param {*} data - The value to normalise (object, array, primitive, or null).
 * @param {Object} [options={}] - Normalisation options.
 * @param {string[]} [options.lowercase=[]] - Field names whose string values
 *   should be converted to lower case. Supports dot notation for nested
 *   fields (e.g. `['email', 'address.country']`).
 * @param {string[]} [options.uppercase=[]] - Field names whose string values
 *   should be converted to upper case. Applied after `lowercase` if both
 *   include the same key.
 * @returns {*} A new normalised value with the same structural type as `data`.
 *
 * @example
 * normalizeData({ name: '  Alice  ', email: 'ALICE@example.com' }, {
 *   lowercase: ['email']
 * });
 * // { name: 'Alice', email: 'alice@example.com' }
 *
 * normalizeData([{ code: 'us' }, { code: 'gb' }], { uppercase: ['code'] });
 * // [{ code: 'US' }, { code: 'GB' }]
 *
 * normalizeData({ address: { city: 'new york' } }, {
 *   uppercase: ['address.city']
 * });
 * // { address: { city: 'NEW YORK' } }
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
