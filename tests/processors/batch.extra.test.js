const { processBatch } = require('../../src/processors/batch');

describe('Batch Processor – additional coverage', () => {
  describe('input validation', () => {
    test('throws when items is undefined', async () => {
      await expect(processBatch(undefined, (x) => x)).rejects.toThrow('Items array is required');
    });

    test('throws when items is not an array (object)', async () => {
      await expect(processBatch({ 0: 'a' }, (x) => x)).rejects.toThrow('Items must be an array');
    });

    test('throws when items is a string', async () => {
      await expect(processBatch('hello', (x) => x)).rejects.toThrow('Items must be an array');
    });

    test('throws when items is a number', async () => {
      await expect(processBatch(42, (x) => x)).rejects.toThrow('Items must be an array');
    });
  });

  describe('failed item structure', () => {
    test('failed item includes item, error message, and index', async () => {
      const items = ['ok', 'bad', 'ok2'];
      const transform = (item) => {
        if (item === 'bad') throw new Error('bad item error');
        return item;
      };

      const result = await processBatch(items, transform);

      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].item).toBe('bad');
      expect(result.failed[0].error).toBe('bad item error');
      expect(result.failed[0].index).toBe(1);
    });

    test('records correct index for multiple failures', async () => {
      const items = [0, 1, 2, 3, 4];
      const transform = (item) => {
        if (item % 2 === 0) throw new Error('even');
        return item;
      };

      const result = await processBatch(items, transform);

      expect(result.failed.map(f => f.index)).toEqual([0, 2, 4]);
    });
  });

  describe('onProgress callback', () => {
    test('calls onProgress at batchSize intervals and final item', async () => {
      const items = [1, 2, 3, 4, 5];
      const progressUpdates = [];

      await processBatch(items, (x) => x, {
        batchSize: 2,
        onProgress: (p) => progressUpdates.push(p)
      });

      // Called at processed=2, processed=4, processed=5 (last)
      expect(progressUpdates.length).toBe(3);
      expect(progressUpdates[0].processed).toBe(2);
      expect(progressUpdates[1].processed).toBe(4);
      expect(progressUpdates[2].processed).toBe(5);
    });

    test('progress percentage reaches 100 on last item', async () => {
      const items = [1, 2, 3];
      let lastProgress;

      await processBatch(items, (x) => x, {
        onProgress: (p) => { lastProgress = p; }
      });

      expect(lastProgress.percentage).toBe(100);
      expect(lastProgress.total).toBe(3);
    });

    test('progress callback not called when not provided', async () => {
      // Should not throw even without onProgress
      const result = await processBatch([1, 2], (x) => x * 2);
      expect(result.successful).toEqual([2, 4]);
    });
  });

  describe('promise-returning non-async function', () => {
    test('handles function returning a Promise explicitly', async () => {
      const items = [1, 2, 3];
      const transform = (item) => Promise.resolve(item * 3);

      const result = await processBatch(items, transform);

      expect(result.successful).toEqual([3, 6, 9]);
      expect(result.failed).toHaveLength(0);
    });
  });

  describe('stats accuracy', () => {
    test('stats reflect total, succeeded, failed counts', async () => {
      const items = Array.from({ length: 10 }, (_, i) => i);
      const transform = (item) => {
        if (item < 3) throw new Error('too small');
        return item;
      };

      const result = await processBatch(items, transform);

      expect(result.stats.total).toBe(10);
      expect(result.stats.succeeded).toBe(7);
      expect(result.stats.failed).toBe(3);
    });
  });
});
