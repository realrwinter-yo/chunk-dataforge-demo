/**
 * Validates an email address.
 *
 * The input is trimmed and lowercased before validation. A basic format check
 * (`local@domain.tld`) is applied — it does not perform DNS or MX-record
 * lookups and does not guarantee deliverability.
 *
 * @param {string} email - The raw email address to validate.
 * @returns {{ valid: true, value: string } | { valid: false, error: string }}
 *   On success, `value` is the normalised (trimmed + lowercased) address.
 *   On failure, `error` describes why validation failed.
 *
 * @example
 * validateEmail('User@Example.com');
 * // { valid: true, value: 'user@example.com' }
 *
 * validateEmail('not-an-email');
 * // { valid: false, error: 'Invalid email format' }
 *
 * validateEmail('');
 * // { valid: false, error: 'Email is required' }
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      error: 'Email is required'
    };
  }

  const normalized = email.trim().toLowerCase();

  if (normalized.length === 0) {
    return {
      valid: false,
      error: 'Email is required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalized)) {
    return {
      valid: false,
      error: 'Invalid email format'
    };
  }

  return {
    valid: true,
    value: normalized
  };
}

module.exports = { validateEmail };
