/**
 * Validates and normalises a currency value (USD).
 *
 * Accepts numeric values as strings or numbers. An optional leading `$` and
 * thousands separators (`,`) are stripped before parsing. Negative values and
 * non-numeric input are rejected.
 *
 * The formatted output always uses a `$` prefix, two decimal places, and
 * comma-separated thousands for values ≥ 1000.
 *
 * @param {string|number} value - The currency value to validate. May include
 *   a leading `$` and/or comma separators (e.g. `"$1,234.56"` or `1234.56`).
 * @returns {{ valid: true, value: number, formatted: string } | { valid: false, error: string }}
 *   On success:
 *   - `value`     — parsed floating-point number (e.g. `1234.56`)
 *   - `formatted` — display string (e.g. `"$1,234.56"`)
 *   On failure, `error` describes why validation failed.
 *
 * @example
 * validateCurrency('$1,234.56');
 * // { valid: true, value: 1234.56, formatted: '$1,234.56' }
 *
 * validateCurrency(9.99);
 * // { valid: true, value: 9.99, formatted: '$9.99' }
 *
 * validateCurrency('-5.00');
 * // { valid: false, error: 'Negative values are not allowed' }
 *
 * validateCurrency('abc');
 * // { valid: false, error: 'Invalid currency format' }
 */
function validateCurrency(value) {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: 'Currency value is required'
    };
  }

  const strValue = String(value).trim();

  if (strValue.length === 0) {
    return {
      valid: false,
      error: 'Currency value is required'
    };
  }

  // Remove dollar sign and commas
  let cleaned = strValue;
  if (cleaned.startsWith('$')) {
    cleaned = cleaned.substring(1);
  }
  cleaned = cleaned.replace(/,/g, '');

  // Check for negative values
  if (cleaned.startsWith('-')) {
    return {
      valid: false,
      error: 'Negative values are not allowed'
    };
  }

  // Parse the number
  const numValue = parseFloat(cleaned);

  if (isNaN(numValue)) {
    return {
      valid: false,
      error: 'Invalid currency format'
    };
  }

  // Format the output
  let formatted;
  if (numValue >= 1000) {
    const parts = numValue.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = '$' + parts.join('.');
  } else {
    formatted = '$' + numValue.toFixed(2);
  }

  return {
    valid: true,
    value: numValue,
    formatted: formatted
  };
}

module.exports = { validateCurrency };
