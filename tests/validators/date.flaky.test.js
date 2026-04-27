const { validateDate } = require('../../src/validators/date');

describe('Date Validator - Timing Sensitive', () => {
  test('validates current date', () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const result = validateDate(dateStr);

    expect(result.valid).toBe(true);
    expect(result.parsed.getFullYear()).toBe(now.getFullYear());
    expect(result.parsed.getMonth()).toBe(now.getMonth());
    expect(result.parsed.getDate()).toBe(now.getDate());
  });

  test('processes multiple dates synchronously', () => {
    const dates = ['2024-01-15', '2024-06-20', '2024-12-31'];

    for (const date of dates) {
      const result = validateDate(date);
      expect(result.valid).toBe(true);
    }
  });
});
