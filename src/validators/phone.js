const ALLOWED_PHONE_CHARS = /[\d\s\-().]/g;

/**
 * Formats a 10-digit phone number
 * @param {string} digits - 10-digit phone number
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(digits) {
  const areaCode = digits.substring(0, 3);
  const exchange = digits.substring(3, 6);
  const subscriber = digits.substring(6, 10);
  return `(${areaCode}) ${exchange}-${subscriber}`;
}

/**
 * Validates a US phone number
 * @param {string} phone - The phone number to validate
 * @returns {Object} Validation result
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (digits.length !== 10) {
    return { valid: false, error: 'Phone number must be 10 digits' };
  }

  const invalidChars = phone.replace(ALLOWED_PHONE_CHARS, '');
  if (invalidChars.length > 0) {
    return { valid: false, error: 'Phone number contains invalid characters' };
  }

  return {
    valid: true,
    value: digits,
    formatted: formatPhoneNumber(digits)
  };
}

module.exports = { validatePhone };
