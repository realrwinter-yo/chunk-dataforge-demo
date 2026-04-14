const { validateDate } = require('../../src/validators/date');

describe('Date Validator - Timing Sensitive', () => {
  test('validates current date within acceptable range', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const result = validateDate(dateStr);

    expect(result.valid).toBe(true);
    expect(result.value).toBe(dateStr);
  });

  test('processes dates within timeout', async () => {
    const dates = ['2024-01-15', '2024-06-20', '2024-12-31'];
    const startTime = Date.now();

    for (const date of dates) {
      validateDate(date);
    }

    const elapsed = Date.now() - startTime;
    // Synchronous validation should complete well within 100ms
    expect(elapsed).toBeLessThan(100);
  });
});
