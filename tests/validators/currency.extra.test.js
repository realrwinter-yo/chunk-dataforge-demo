const { validateCurrency } = require('../../src/validators/currency');

describe('Currency Validator – additional coverage', () => {
  describe('null / undefined input', () => {
    test('rejects null', () => {
      const result = validateCurrency(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Currency value is required');
    });

    test('rejects undefined', () => {
      const result = validateCurrency(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Currency value is required');
    });
  });

  describe('numeric input coercion', () => {
    test('accepts numeric value (coerced to string internally)', () => {
      const result = validateCurrency(50);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(50);
    });
  });

  describe('thousands formatting', () => {
    test('formats value >= 1000 with comma separator', () => {
      const result = validateCurrency('1000');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('$1,000.00');
    });

    test('formats large value with multiple comma groups', () => {
      const result = validateCurrency('1234567.89');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('$1,234,567.89');
    });

    test('accepts dollar sign combined with commas', () => {
      const result = validateCurrency('$1,000.00');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(1000);
      expect(result.formatted).toBe('$1,000.00');
    });
  });

  describe('edge cases', () => {
    test('rejects negative value with dollar sign', () => {
      const result = validateCurrency('$-50.00');
      // After stripping '$', cleaned is '-50.00' which starts with '-'
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Negative values are not allowed');
    });

    test('whitespace-only string is invalid', () => {
      const result = validateCurrency('   ');
      expect(result.valid).toBe(false);
    });

    test('returns correct value for boundary 999.99', () => {
      const result = validateCurrency('999.99');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('$999.99');
    });
  });
});
