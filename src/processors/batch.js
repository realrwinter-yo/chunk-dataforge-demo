/**
 * Applies a transform function to every item in an array, collecting
 * successes and failures independently so that a single bad item does not
 * abort the entire run.
 *
 * Both synchronous and async transform functions are supported. The items
 * are processed sequentially (not in parallel), which keeps memory usage
 * predictable for large arrays.
 *
 * @param {Array} items - The array of items to process. Must be a non-null array.
 * @param {Function} transform - Called with each item. May be sync or async.
 *   If it throws (or returns a rejected Promise), the item is recorded in
 *   `failed`; otherwise its return value is recorded in `successful`.
 * @param {Object} [options={}] - Processing options.
 * @param {number} [options.batchSize=10] - Controls how frequently
 *   `onProgress` is called. Progress is reported after every `batchSize`
 *   items and once at the very end.
 * @param {Function} [options.onProgress] - Optional callback invoked with
 *   progress info: `{ processed: number, total: number, percentage: number }`.
 * @returns {Promise<{ successful: any[], failed: Array<{ item: any, error: string, index: number }>, stats: { total: number, succeeded: number, failed: number } }>}
 *   Resolves with:
 *   - `successful` — transformed values for items that did not throw
 *   - `failed`     — descriptors for items that threw, including original
 *                    item, error message, and zero-based index
 *   - `stats`      — summary counts
 * @throws {Error} If `items` is missing or not an array.
 *
 * @example
 * const result = await processBatch(
 *   [1, 2, 'oops', 4],
 *   (n) => {
 *     if (typeof n !== 'number') throw new Error('not a number');
 *     return n * 2;
 *   }
 * );
 * // result.successful => [2, 4, 8]
 * // result.failed     => [{ item: 'oops', error: 'not a number', index: 2 }]
 * // result.stats      => { total: 4, succeeded: 3, failed: 1 }
 *
 * @example <caption>With progress reporting</caption>
 * await processBatch(items, transform, {
 *   batchSize: 50,
 *   onProgress: ({ processed, total, percentage }) => {
 *     console.log(`${percentage}% complete (${processed}/${total})`);
 *   }
 * });
 */
async function processBatch(items, transform, options = {}) {
  if (!items) {
    throw new Error('Items array is required');
  }

  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  const batchSize = options.batchSize || 10;
  const onProgress = options.onProgress || null;

  const successful = [];
  const failed = [];
  let processed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    try {
      let result;
      if (transform.constructor.name === 'AsyncFunction') {
        result = await transform(item);
      } else {
        result = transform(item);
        if (result instanceof Promise) {
          result = await result;
        }
      }
      successful.push(result);
    } catch (error) {
      failed.push({
        item: item,
        error: error.message,
        index: i
      });
    }

    processed++;

    if (onProgress) {
      if (processed % batchSize === 0 || processed === items.length) {
        onProgress({
          processed: processed,
          total: items.length,
          percentage: Math.round((processed / items.length) * 100)
        });
      }
    }
  }

  return {
    successful: successful,
    failed: failed,
    stats: {
      total: items.length,
      succeeded: successful.length,
      failed: failed.length
    }
  };
}

module.exports = { processBatch };
