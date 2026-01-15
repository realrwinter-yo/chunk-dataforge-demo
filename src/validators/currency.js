/**
 * Formats a number as currency with commas and dollar sign
 * @param {number} amount - The numeric amount
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  const fixed = amount.toFixed(2);
  const [whole, decimal] = fixed.split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${withCommas}.${decimal}`;
}

/**
 * Validates a currency value
 * @param {string} value - The currency value to validate
 * @returns {Object} Validation result
 */
function validateCurrency(value) {
  if (value == null || String(value).trim().length === 0) {
    return { valid: false, error: 'Currency value is required' };
  }

  const strValue = String(value).trim();
  const cleaned = strValue.replace(/^\$/, '').replace(/,/g, '');

  if (cleaned.startsWith('-')) {
    return { valid: false, error: 'Negative values are not allowed' };
  }

  const numValue = parseFloat(cleaned);

  if (isNaN(numValue)) {
    return { valid: false, error: 'Invalid currency format' };
  }

  return {
    valid: true,
    value: numValue,
    formatted: formatCurrency(numValue)
  };
}

module.exports = { validateCurrency };
