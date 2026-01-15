/**
 * Processes items in batches with error handling
 * @param {Array} items - Items to process
 * @param {Function} transform - Transform function
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
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
