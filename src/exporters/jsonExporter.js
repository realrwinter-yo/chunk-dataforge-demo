/**
 * Serialises data to a JSON string, optionally including metadata and
 * filtering out empty values.
 *
 * The output is always a JSON object with a `data` key. When
 * `options.includeMetadata` is `true` a `metadata` key is added alongside it.
 *
 * @param {*} data - The value to export. Must not be `null` or `undefined`.
 * @param {Object} [options={}] - Export options.
 * @param {boolean} [options.pretty=true] - If `true` (default), the output is
 *   pretty-printed with 2-space indentation. Set to `false` for compact JSON.
 * @param {boolean} [options.includeMetadata=false] - When `true`, appends a
 *   `metadata` object containing `exportedAt` (ISO timestamp), `recordCount`,
 *   and `format: "json"`.
 * @param {boolean} [options.filterEmpty=false] - When `true`:
 *   - Arrays: `null`, `undefined`, and empty-object elements are removed.
 *   - Objects: keys whose value is `null`, `undefined`, or `""` are removed.
 *   Has no effect on other data types.
 * @returns {string} A JSON string wrapping the (optionally filtered) data
 *   under a `data` key.
 * @throws {Error} If `data` is `null` or `undefined`.
 *
 * @example
 * exportToJson([{ name: 'Alice' }, null], { filterEmpty: true });
 * // '{\n  "data": [\n    { "name": "Alice" }\n  ]\n}'
 *
 * exportToJson({ a: 1 }, { pretty: false, includeMetadata: true });
 * // '{"data":{"a":1},"metadata":{"exportedAt":"...","recordCount":1,"format":"json"}}'
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

/**
 * Serialises an array of values to JSON Lines (JSONL) format.
 *
 * JSON Lines is a newline-delimited format where each line is a valid,
 * self-contained JSON value. It is commonly used for streaming data,
 * log files, and large dataset exports because the file can be processed
 * one record at a time without loading the entire structure into memory.
 *
 * @param {Array} data - The array of values to serialise. Each element is
 *   serialised independently with `JSON.stringify`.
 * @returns {string} A string where each line is the JSON representation of
 *   one element, joined by newline characters (`\n`).
 * @throws {Error} If `data` is not an array.
 *
 * @example
 * exportToJsonLines([{ id: 1 }, { id: 2 }]);
 * // '{"id":1}\n{"id":2}'
 */
function exportToJsonLines(data) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array for JSON Lines export');
  }

  return data.map(item => JSON.stringify(item)).join('\n');
}

/**
 * Parses a JSON string without throwing on invalid input.
 *
 * Use this in place of a bare `JSON.parse` call when the input is untrusted
 * or may be malformed. The caller can inspect `success` to branch without
 * wrapping calls in try/catch.
 *
 * @param {string} jsonString - The JSON string to parse.
 * @returns {{ success: true, data: any } | { success: false, error: string }}
 *   On success, `data` holds the parsed value.
 *   On failure, `error` holds the underlying `SyntaxError` message.
 * @throws {Error} If `jsonString` is not a string (type error, not parse error).
 *
 * @example
 * parseJsonSafely('{"key":"value"}');
 * // { success: true, data: { key: 'value' } }
 *
 * parseJsonSafely('not json');
 * // { success: false, error: 'Unexpected token ...' }
 */
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
