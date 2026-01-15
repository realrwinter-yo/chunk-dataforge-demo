const { validateEmail } = require('../../src/validators/email');

describe('Email Validator', () => {
  describe('valid emails', () => {
    test('accepts standard email format', () => {
      expect(validateEmail('user@example.com')).toEqual({
        valid: true,
        value: 'user@example.com'
      });
    });

    test('accepts email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toEqual({
        valid: true,
        value: 'user@mail.example.com'
      });
    });

    test('accepts email with plus sign', () => {
      expect(validateEmail('user+tag@example.com')).toEqual({
        valid: true,
        value: 'user+tag@example.com'
      });
    });

    test('accepts email with dots in local part', () => {
      expect(validateEmail('first.last@example.com')).toEqual({
        valid: true,
        value: 'first.last@example.com'
      });
    });
  });

  describe('invalid emails', () => {
    test('rejects email without @ symbol', () => {
      const result = validateEmail('userexample.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects email without domain', () => {
      const result = validateEmail('user@');
      expect(result.valid).toBe(false);
    });

    test('rejects email without local part', () => {
      const result = validateEmail('@example.com');
      expect(result.valid).toBe(false);
    });

    test('rejects empty string', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
    });
  });

  describe('normalization', () => {
    test('trims whitespace', () => {
      expect(validateEmail('  user@example.com  ')).toEqual({
        valid: true,
        value: 'user@example.com'
      });
    });

    test('converts to lowercase', () => {
      expect(validateEmail('USER@EXAMPLE.COM')).toEqual({
        valid: true,
        value: 'user@example.com'
      });
    });
  });
});
