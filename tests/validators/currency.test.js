const { validateCurrency } = require('../../src/validators/currency');

describe('Currency Validator', () => {
  describe('valid currency values', () => {
    test('accepts plain number', () => {
      expect(validateCurrency('100')).toEqual({
        valid: true,
        value: 100,
        formatted: '$100.00'
      });
    });

    test('accepts decimal values', () => {
      expect(validateCurrency('99.99')).toEqual({
        valid: true,
        value: 99.99,
        formatted: '$99.99'
      });
    });

    test('accepts value with dollar sign', () => {
      expect(validateCurrency('$50.00')).toEqual({
        valid: true,
        value: 50,
        formatted: '$50.00'
      });
    });

    test('accepts value with commas', () => {
      expect(validateCurrency('1,234.56')).toEqual({
        valid: true,
        value: 1234.56,
        formatted: '$1,234.56'
      });
    });

    test('accepts zero', () => {
      expect(validateCurrency('0')).toEqual({
        valid: true,
        value: 0,
        formatted: '$0.00'
      });
    });
  });

  describe('invalid currency values', () => {
    test('rejects negative values', () => {
      const result = validateCurrency('-50');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects non-numeric strings', () => {
      const result = validateCurrency('abc');
      expect(result.valid).toBe(false);
    });

    test('rejects empty string', () => {
      const result = validateCurrency('');
      expect(result.valid).toBe(false);
    });
  });
});
