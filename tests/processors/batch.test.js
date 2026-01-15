const { processBatch } = require('../../src/processors/batch');

describe('Batch Processor', () => {
  describe('basic processing', () => {
    test('processes array of items with transform function', async () => {
      const items = [1, 2, 3, 4, 5];
      const transform = (item) => item * 2;

      const result = await processBatch(items, transform);

      expect(result.successful).toEqual([2, 4, 6, 8, 10]);
      expect(result.failed).toEqual([]);
      expect(result.stats.total).toBe(5);
      expect(result.stats.succeeded).toBe(5);
      expect(result.stats.failed).toBe(0);
    });

    test('handles async transform functions', async () => {
      const items = ['a', 'b', 'c'];
      const transform = async (item) => {
        return item.toUpperCase();
      };

      const result = await processBatch(items, transform);

      expect(result.successful).toEqual(['A', 'B', 'C']);
    });
  });

  describe('error handling', () => {
    test('captures failed items', async () => {
      const items = [1, 2, 'invalid', 4];
      const transform = (item) => {
        if (typeof item !== 'number') {
          throw new Error('Not a number');
        }
        return item * 2;
      };

      const result = await processBatch(items, transform);

      expect(result.successful).toEqual([2, 4, 8]);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].item).toBe('invalid');
      expect(result.failed[0].error).toBeDefined();
    });

    test('continues processing after errors', async () => {
      const items = [1, 'bad', 3, 'worse', 5];
      const transform = (item) => {
        if (typeof item !== 'number') throw new Error('Invalid');
        return item * 10;
      };

      const result = await processBatch(items, transform);

      expect(result.successful).toEqual([10, 30, 50]);
      expect(result.failed).toHaveLength(2);
      expect(result.stats.succeeded).toBe(3);
      expect(result.stats.failed).toBe(2);
    });
  });

  describe('options', () => {
    test('respects batch size option', async () => {
      const items = [1, 2, 3, 4, 5];
      let callCount = 0;
      const transform = (item) => {
        callCount++;
        return item;
      };

      await processBatch(items, transform, { batchSize: 2 });

      expect(callCount).toBe(5);
    });

    test('calls onProgress callback', async () => {
      const items = [1, 2, 3];
      const progressUpdates = [];
      const onProgress = (progress) => {
        progressUpdates.push(progress);
      };

      await processBatch(items, (x) => x, { onProgress });

      expect(progressUpdates.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    test('handles empty array', async () => {
      const result = await processBatch([], (x) => x);

      expect(result.successful).toEqual([]);
      expect(result.failed).toEqual([]);
      expect(result.stats.total).toBe(0);
    });

    test('throws error for invalid input', async () => {
      await expect(processBatch(null, (x) => x)).rejects.toThrow();
    });
  });
});
