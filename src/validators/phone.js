/**
 * Validates a US phone number.
 *
 * Accepts common formatting characters — spaces, dashes, dots, and
 * parentheses — in addition to digits. After stripping all non-digit
 * characters the number must be exactly 10 digits. 11-digit numbers
 * (country code `1` prefix) are not currently supported.
 *
 * @param {string} phone - The raw phone number string to validate.
 * @returns {{ valid: true, value: string, formatted: string } | { valid: false, error: string }}
 *   On success:
 *   - `value`     — 10-digit string with no formatting (e.g. `"5551234567"`)
 *   - `formatted` — standard US format (e.g. `"(555) 123-4567"`)
 *   On failure, `error` describes why validation failed.
 *
 * @example
 * validatePhone('(555) 123-4567');
 * // { valid: true, value: '5551234567', formatted: '(555) 123-4567' }
 *
 * validatePhone('555.123.4567');
 * // { valid: true, value: '5551234567', formatted: '(555) 123-4567' }
 *
 * validatePhone('123');
 * // { valid: false, error: 'Phone number must be 10 digits' }
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return {
      valid: false,
      error: 'Phone number is required'
    };
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) {
    return {
      valid: false,
      error: 'Phone number is required'
    };
  }

  if (digits.length !== 10) {
    return {
      valid: false,
      error: 'Phone number must be 10 digits'
    };
  }

  // Check if original had non-numeric characters that aren't formatting
  const allowedChars = phone.replace(/[\d\s\-().]/g, '');
  if (allowedChars.length > 0) {
    return {
      valid: false,
      error: 'Phone number contains invalid characters'
    };
  }

  const areaCode = digits.substring(0, 3);
  const exchange = digits.substring(3, 6);
  const subscriber = digits.substring(6, 10);

  return {
    valid: true,
    value: digits,
    formatted: `(${areaCode}) ${exchange}-${subscriber}`
  };
}

module.exports = { validatePhone };
