/**
 * Validates a US phone number
 * @param {string} phone - The phone number to validate
 * @returns {Object} Validation result
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
