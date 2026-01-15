/**
 * Validates a currency value
 * @param {string} value - The currency value to validate
 * @returns {Object} Validation result
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
