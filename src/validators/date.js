/**
 * Validates a date string in various formats
 * @param {string} dateStr - The date string to validate
 * @returns {Object} Validation result
 */
function validateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return {
      valid: false,
      error: 'Date is required'
    };
  }

  const trimmed = dateStr.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Date is required'
    };
  }

  let year, month, day;

  // Try ISO format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10);
    day = parseInt(isoMatch[3], 10);
  }

  // Try US format: MM/DD/YYYY
  if (!year) {
    const usMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (usMatch) {
      month = parseInt(usMatch[1], 10);
      day = parseInt(usMatch[2], 10);
      year = parseInt(usMatch[3], 10);
    }
  }

  // Try European format: DD.MM.YYYY
  if (!year) {
    const euMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (euMatch) {
      day = parseInt(euMatch[1], 10);
      month = parseInt(euMatch[2], 10);
      year = parseInt(euMatch[3], 10);
    }
  }

  if (!year) {
    return {
      valid: false,
      error: 'Invalid date format'
    };
  }

  // Validate month
  if (month < 1 || month > 12) {
    return {
      valid: false,
      error: 'Invalid month'
    };
  }

  // Validate day based on month
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const maxDay = daysInMonth[month - 1];

  if (day < 1 || day > maxDay) {
    return {
      valid: false,
      error: 'Invalid day for the given month'
    };
  }

  // Create normalized ISO string
  const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const parsed = new Date(year, month - 1, day);

  return {
    valid: true,
    value: isoString,
    parsed: parsed
  };
}

module.exports = { validateDate };
