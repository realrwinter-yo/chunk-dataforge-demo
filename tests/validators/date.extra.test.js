const { validateDate } = require('../../src/validators/date');

describe('Date Validator – additional coverage', () => {
  describe('null / non-string input', () => {
    test('rejects null', () => {
      const result = validateDate(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Date is required');
    });

    test('rejects undefined', () => {
      const result = validateDate(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Date is required');
    });

    test('rejects numeric input', () => {
      const result = validateDate(20240115);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Date is required');
    });
  });

  describe('whitespace', () => {
    test('rejects whitespace-only string', () => {
      const result = validateDate('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Date is required');
    });
  });

  describe('month boundary validation', () => {
    test('rejects month 0', () => {
      const result = validateDate('2024-00-01');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid month');
    });

    test('rejects month 13 via US format', () => {
      const result = validateDate('13/01/2024');
      expect(result.valid).toBe(false);
    });
  });

  describe('day boundary validation', () => {
    test('rejects day 0', () => {
      const result = validateDate('2024-06-00');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid day for the given month');
    });

    test('rejects April 31 (30-day month)', () => {
      const result = validateDate('2024-04-31');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid day for the given month');
    });

    test('rejects February 29 (non-leap year, since validator uses fixed 28 days)', () => {
      const result = validateDate('2023-02-29');
      expect(result.valid).toBe(false);
    });

    test('accepts February 28', () => {
      const result = validateDate('2023-02-28');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('2023-02-28');
    });
  });

  describe('European format (DD.MM.YYYY)', () => {
    test('parses valid European date', () => {
      const result = validateDate('25.12.2023');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('2023-12-25');
    });

    test('rejects invalid European date with bad day', () => {
      const result = validateDate('32.01.2024');
      expect(result.valid).toBe(false);
    });
  });

  describe('unrecognised format', () => {
    test('rejects YYYY/MM/DD (unsupported format)', () => {
      const result = validateDate('2024/01/15');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid date format');
    });
  });

  describe('output structure', () => {
    test('parsed field is a Date instance', () => {
      const result = validateDate('2024-06-15');
      expect(result.parsed).toBeInstanceOf(Date);
    });

    test('value field is correctly zero-padded ISO string', () => {
      const result = validateDate('01/05/2024'); // MM/DD/YYYY -> Jan 5
      expect(result.valid).toBe(true);
      expect(result.value).toBe('2024-01-05');
    });
  });
});
