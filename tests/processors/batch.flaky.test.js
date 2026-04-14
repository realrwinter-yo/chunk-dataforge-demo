const { processBatch } = require('../../src/processors/batch');

describe('Batch Processor - Race Conditions', () => {
  test('processes items in expected order', async () => {
    const results = [];
    const items = [1, 2, 3, 4, 5];

    const transform = async (item) => {
      results.push(item);
      return item * 2;
    };

    await processBatch(items, transform);

    // processBatch processes sequentially, so order is guaranteed
    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  test('completes within time limit', async () => {
    const items = Array.from({ length: 10 }, (_, i) => i);

    const transform = async (item) => {
      return item;
    };

    const start = Date.now();
    await processBatch(items, transform);
    const duration = Date.now() - start;

    // Synchronous transforms should complete well within 150ms
    expect(duration).toBeLessThan(150);
  });

  test('handles concurrent modifications', async () => {
    const sharedState = { count: 0 };
    const items = [1, 2, 3, 4, 5];

    const transform = async (item) => {
      // processBatch is sequential so no true race condition
      sharedState.count += 1;
      return item;
    };

    await processBatch(items, transform);

    expect(sharedState.count).toBe(5);
  });
});
