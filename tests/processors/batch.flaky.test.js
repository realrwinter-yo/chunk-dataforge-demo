const { processBatch } = require('../../src/processors/batch');

describe('Batch Processor - Race Conditions', () => {
  test('processes items in expected order', async () => {
    const results = [];
    const items = [1, 2, 3, 4, 5];

    const transform = async (item) => {
      // Random delay causes race condition
      await new Promise(r => setTimeout(r, Math.random() * 30));
      results.push(item);
      return item * 2;
    };

    await processBatch(items, transform);

    // Flaky: order is not guaranteed due to random delays
    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  test('completes within time limit', async () => {
    const items = Array.from({ length: 10 }, (_, i) => i);

    const transform = async (item) => {
      // Unpredictable delay
      const delay = Math.random() * 20;
      await new Promise(r => setTimeout(r, delay));
      return item;
    };

    const start = Date.now();
    await processBatch(items, transform);
    const duration = Date.now() - start;

    // Flaky: cumulative random delays may exceed threshold
    expect(duration).toBeLessThan(150);
  });

  test('handles concurrent modifications', async () => {
    const sharedState = { count: 0 };
    const items = [1, 2, 3, 4, 5];

    const transform = async (item) => {
      const current = sharedState.count;
      await new Promise(r => setTimeout(r, Math.random() * 10));
      // Race condition: multiple transforms may read same value
      sharedState.count = current + 1;
      return item;
    };

    await processBatch(items, transform);

    // Flaky: race condition means count may not equal items.length
    expect(sharedState.count).toBe(5);
  });
});
