# Processors

Processors apply transformations across collections of items.

## processBatch(items, transform, options?)

Runs `transform` against each item in `items` and collects successes and
failures separately. Failures do not stop the run.

```js
const { processBatch } = require('./src');

const result = await processBatch(
  [1, 2, 'oops', 4],
  (n) => {
    if (typeof n !== 'number') throw new Error('not a number');
    return n * 2;
  }
);

// result.successful => [2, 4, 8]
// result.failed     => [{ item: 'oops', error: 'not a number', index: 2 }]
// result.stats      => { total: 4, succeeded: 3, failed: 1 }
```

Both synchronous and async `transform` functions are supported.

### Options

- `batchSize` — controls how often `onProgress` fires (default `10`)
- `onProgress(info)` — called with `{ processed, total, percentage }`
