const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {Object} Validation result
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, value: normalized };
}

module.exports = { validateEmail };
