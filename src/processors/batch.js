/**
 * Executes a transform function and awaits if necessary
 * @param {Function} transform - Transform function
 * @param {*} item - Item to transform
 * @returns {Promise<*>} Transformed result
 */
async function executeTransform(transform, item) {
  const result = transform(item);
  return result instanceof Promise ? await result : result;
}

/**
 * Reports progress if callback is provided
 * @param {Function|null} onProgress - Progress callback
 * @param {number} processed - Items processed
 * @param {number} total - Total items
 * @param {number} batchSize - Batch size for reporting
 */
function reportProgress(onProgress, processed, total, batchSize) {
  if (!onProgress) return;

  if (processed % batchSize === 0 || processed === total) {
    onProgress({
      processed,
      total,
      percentage: Math.round((processed / total) * 100)
    });
  }
}

/**
 * Processes items in batches with error handling
 * @param {Array} items - Items to process
 * @param {Function} transform - Transform function
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
 */
async function processBatch(items, transform, options = {}) {
  if (!items || !Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  const { batchSize = 10, onProgress = null } = options;
  const successful = [];
  const failed = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const result = await executeTransform(transform, items[i]);
      successful.push(result);
    } catch (error) {
      failed.push({
        item: items[i],
        error: error.message,
        index: i
      });
    }

    reportProgress(onProgress, i + 1, items.length, batchSize);
  }

  return {
    successful,
    failed,
    stats: {
      total: items.length,
      succeeded: successful.length,
      failed: failed.length
    }
  };
}

module.exports = { processBatch };
