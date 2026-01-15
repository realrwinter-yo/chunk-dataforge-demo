const { validatePhone } = require('../../src/validators/phone');

describe('Phone Validator', () => {
  describe('valid US phone numbers', () => {
    test('accepts 10-digit format', () => {
      expect(validatePhone('5551234567')).toEqual({
        valid: true,
        value: '5551234567',
        formatted: '(555) 123-4567'
      });
    });

    test('accepts format with dashes', () => {
      expect(validatePhone('555-123-4567')).toEqual({
        valid: true,
        value: '5551234567',
        formatted: '(555) 123-4567'
      });
    });

    test('accepts format with parentheses', () => {
      expect(validatePhone('(555) 123-4567')).toEqual({
        valid: true,
        value: '5551234567',
        formatted: '(555) 123-4567'
      });
    });

    test('accepts format with dots', () => {
      expect(validatePhone('555.123.4567')).toEqual({
        valid: true,
        value: '5551234567',
        formatted: '(555) 123-4567'
      });
    });
  });

  describe('invalid phone numbers', () => {
    test('rejects too few digits', () => {
      const result = validatePhone('55512345');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects too many digits', () => {
      const result = validatePhone('555123456789');
      expect(result.valid).toBe(false);
    });

    test('rejects non-numeric characters', () => {
      const result = validatePhone('555-ABC-4567');
      expect(result.valid).toBe(false);
    });

    test('rejects empty string', () => {
      const result = validatePhone('');
      expect(result.valid).toBe(false);
    });
  });
});
