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

    test('rejects null', () => {
      const result = validatePhone(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('rejects non-string input', () => {
      const result = validatePhone(1234567890);
      expect(result.valid).toBe(false);
    });

    test('rejects phone with only formatting characters', () => {
      const result = validatePhone('---');
      expect(result.valid).toBe(false);
    });

    test('rejects phone with invalid special characters', () => {
      const result = validatePhone('5551234567#');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number contains invalid characters');
    });

    test('rejects undefined input', () => {
      const result = validatePhone(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });
  });

  describe('formatting output', () => {
    test('provides formatted output for valid phone', () => {
      const result = validatePhone('5551234567');
      expect(result.formatted).toBe('(555) 123-4567');
    });

    test('extracts digits correctly from formatted input', () => {
      const result = validatePhone('(555) 123-4567');
      expect(result.value).toBe('5551234567');
    });
  });
});
