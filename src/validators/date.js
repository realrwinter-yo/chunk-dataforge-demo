const DATE_FORMATS = [
  { regex: /^(\d{4})-(\d{2})-(\d{2})$/, parser: (m) => ({ year: m[1], month: m[2], day: m[3] }) },
  { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, parser: (m) => ({ month: m[1], day: m[2], year: m[3] }) },
  { regex: /^(\d{2})\.(\d{2})\.(\d{4})$/, parser: (m) => ({ day: m[1], month: m[2], year: m[3] }) }
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Parses a date string using multiple format patterns
 * @param {string} dateStr - The date string to parse
 * @returns {Object|null} Parsed date components or null
 */
function parseDateString(dateStr) {
  for (const format of DATE_FORMATS) {
    const match = dateStr.match(format.regex);
    if (match) {
      const { year, month, day } = format.parser(match);
      return {
        year: parseInt(year, 10),
        month: parseInt(month, 10),
        day: parseInt(day, 10)
      };
    }
  }
  return null;
}

/**
 * Validates date components
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day
 * @returns {Object|null} Error object or null if valid
 */
function validateDateComponents(year, month, day) {
  if (month < 1 || month > 12) {
    return { error: 'Invalid month' };
  }

  const maxDay = DAYS_IN_MONTH[month - 1];
  if (day < 1 || day > maxDay) {
    return { error: 'Invalid day for the given month' };
  }

  return null;
}

/**
 * Validates a date string in various formats
 * @param {string} dateStr - The date string to validate
 * @returns {Object} Validation result
 */
function validateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim().length === 0) {
    return { valid: false, error: 'Date is required' };
  }

  const trimmed = dateStr.trim();
  const parsed = parseDateString(trimmed);

  if (!parsed) {
    return { valid: false, error: 'Invalid date format' };
  }

  const { year, month, day } = parsed;
  const validationError = validateDateComponents(year, month, day);

  if (validationError) {
    return { valid: false, ...validationError };
  }

  const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dateObj = new Date(year, month - 1, day);

  return {
    valid: true,
    value: isoString,
    parsed: dateObj
  };
}

module.exports = { validateDate };
