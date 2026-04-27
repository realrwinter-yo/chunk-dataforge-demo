const { validatePhone } = require('../../src/validators/phone');

describe('Phone Validator – additional coverage', () => {
  describe('null / non-string input', () => {
    test('rejects null', () => {
      const result = validatePhone(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('rejects undefined', () => {
      const result = validatePhone(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('rejects numeric input', () => {
      const result = validatePhone(5551234567);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });
  });

  describe('digits-only edge cases', () => {
    test('rejects string of only dashes (zero digits)', () => {
      const result = validatePhone('----------');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('rejects 9-digit number', () => {
      const result = validatePhone('123456789');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number must be 10 digits');
    });

    test('rejects 11-digit number', () => {
      const result = validatePhone('15551234567');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number must be 10 digits');
    });
  });

  describe('invalid character detection', () => {
    test('rejects phone with letters', () => {
      // 10 digits present but 'A' is an invalid non-formatting character
      const result = validatePhone('555-123-4567A');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number contains invalid characters');
    });

    test('rejects phone with special characters like #', () => {
      const result = validatePhone('555#123#4567');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number contains invalid characters');
    });
  });

  describe('output structure', () => {
    test('formatted field uses (NXX) NXX-XXXX pattern', () => {
      const result = validatePhone('8005551234');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('(800) 555-1234');
    });

    test('value field contains only digits', () => {
      const result = validatePhone('(800) 555-1234');
      expect(result.valid).toBe(true);
      expect(result.value).toMatch(/^\d{10}$/);
    });
  });

  describe('allowed formatting characters', () => {
    test('accepts spaces as separators', () => {
      const result = validatePhone('555 123 4567');
      expect(result.valid).toBe(true);
    });
  });
});
