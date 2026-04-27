const { validateEmail } = require('../../src/validators/email');

describe('Email Validator – additional coverage', () => {
  describe('null / non-string input', () => {
    test('rejects null', () => {
      const result = validateEmail(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    test('rejects undefined', () => {
      const result = validateEmail(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    test('rejects numeric input', () => {
      const result = validateEmail(123);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    test('rejects object input', () => {
      const result = validateEmail({ email: 'a@b.com' });
      expect(result.valid).toBe(false);
    });
  });

  describe('whitespace handling edge cases', () => {
    test('rejects string that is all whitespace', () => {
      const result = validateEmail('     ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });
  });

  describe('format edge cases', () => {
    test('rejects email with spaces in local part', () => {
      const result = validateEmail('user name@example.com');
      expect(result.valid).toBe(false);
    });

    test('rejects email with multiple @ symbols', () => {
      const result = validateEmail('a@b@example.com');
      expect(result.valid).toBe(false);
    });

    test('accepts email with numeric TLD', () => {
      // The regex only checks for [^\s@]+.[^\s@]+ so numeric TLD passes
      const result = validateEmail('user@example.123');
      expect(result.valid).toBe(true);
    });
  });
});
