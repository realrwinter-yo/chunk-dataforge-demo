const { validateDate } = require('../../src/validators/date');

describe('Date Validator - Timing Sensitive', () => {
  test('validates current date within acceptable range', () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // This test is flaky because it depends on exact timing
    // If the date changes between creating dateStr and validation, it may fail
    const result = validateDate(dateStr);
    const validated = new Date(result.parsed);

    // Flaky: comparing dates across potential day boundary
    expect(validated.getDate()).toBe(now.getDate());
  });

  test('processes dates within timeout', async () => {
    const dates = ['2024-01-15', '2024-06-20', '2024-12-31'];
    const startTime = Date.now();

    for (const date of dates) {
      validateDate(date);
      // Artificial delay that sometimes exceeds threshold
      await new Promise(r => setTimeout(r, Math.random() * 50));
    }

    const elapsed = Date.now() - startTime;
    // Flaky: random delays may cause this to fail intermittently
    expect(elapsed).toBeLessThan(100);
  });
});
