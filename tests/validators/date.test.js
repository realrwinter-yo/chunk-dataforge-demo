const { validateDate } = require('../../src/validators/date');

describe('Date Validator', () => {
  describe('valid dates', () => {
    test('accepts ISO format YYYY-MM-DD', () => {
      expect(validateDate('2024-01-15')).toEqual({
        valid: true,
        value: '2024-01-15',
        parsed: expect.any(Date)
      });
    });

    test('accepts US format MM/DD/YYYY', () => {
      expect(validateDate('01/15/2024')).toEqual({
        valid: true,
        value: '2024-01-15',
        parsed: expect.any(Date)
      });
    });

    test('accepts format with dots DD.MM.YYYY', () => {
      expect(validateDate('15.01.2024')).toEqual({
        valid: true,
        value: '2024-01-15',
        parsed: expect.any(Date)
      });
    });

    test('accepts end of month dates', () => {
      expect(validateDate('2024-01-31')).toEqual({
        valid: true,
        value: '2024-01-31',
        parsed: expect.any(Date)
      });
    });
  });

  describe('invalid dates', () => {
    test('rejects invalid month', () => {
      const result = validateDate('2024-13-01');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects invalid day', () => {
      const result = validateDate('2024-01-32');
      expect(result.valid).toBe(false);
    });

    test('rejects empty string', () => {
      const result = validateDate('');
      expect(result.valid).toBe(false);
    });

    test('rejects malformed date', () => {
      const result = validateDate('not-a-date');
      expect(result.valid).toBe(false);
    });
  });
});
