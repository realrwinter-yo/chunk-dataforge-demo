const { processBatch } = require('../../src/processors/batch');

describe('Batch Processor - Sequential Execution', () => {
  test('processes items in order', async () => {
    const results = [];
    const items = [1, 2, 3, 4, 5];

    const transform = async (item) => {
      results.push(item);
      return item * 2;
    };

    await processBatch(items, transform);

    // processBatch awaits each item sequentially, so order is guaranteed
    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  test('completes all items', async () => {
    const items = Array.from({ length: 10 }, (_, i) => i);

    const transform = async (item) => {
      return item;
    };

    const result = await processBatch(items, transform);
    expect(result.stats.succeeded).toBe(10);
    expect(result.stats.failed).toBe(0);
  });

  test('handles shared state correctly with sequential execution', async () => {
    const sharedState = { count: 0 };
    const items = [1, 2, 3, 4, 5];

    const transform = async (item) => {
      // Sequential execution: no race condition
      sharedState.count += 1;
      return item;
    };

    await processBatch(items, transform);

    expect(sharedState.count).toBe(5);
  });
});
