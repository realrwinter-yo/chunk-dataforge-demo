# Processors

Processors apply transformations across collections of items or compose
multiple transformation steps into an ordered pipeline.

---

## processBatch(items, transform, options?)

Applies a transform function to every item in an array, collecting successes
and failures independently so that a single bad item does not abort the
entire run. Items are processed **sequentially** (not in parallel).

Both synchronous and async transform functions are supported.

**Parameters**

| Name                | Type       | Default | Description                                                                                  |
|---------------------|------------|---------|----------------------------------------------------------------------------------------------|
| `items`             | `Array`    | —       | The array of items to process (required).                                                    |
| `transform`         | `Function` | —       | Called with each item. May be sync or async. Thrown errors move the item to `failed`.        |
| `options`           | `Object`   | `{}`    | Processing options.                                                                          |
| `options.batchSize` | `number`   | `10`    | Controls how frequently `onProgress` is called. Progress fires every `batchSize` items and once at the end. |
| `options.onProgress`| `Function` | `null`  | Optional callback invoked with `{ processed, total, percentage }`.                           |

**Returns** `Promise<Object>` — resolves (never rejects) with:

```js
{
  successful: any[],          // transformed values for items that did not throw
  failed: [                   // descriptors for items that threw
    { item: any, error: string, index: number }
  ],
  stats: {
    total: number,
    succeeded: number,
    failed: number
  }
}
```

**Throws** `Error` if `items` is missing or not an array.

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

**With progress reporting:**

```js
await processBatch(items, transform, {
  batchSize: 50,
  onProgress: ({ processed, total, percentage }) => {
    console.log(`${percentage}% complete (${processed}/${total})`);
  }
});
```

**With an async transform:**

```js
const result = await processBatch(urls, async (url) => {
  const response = await fetch(url);
  return response.json();
});
```

---

## createPipeline()

Creates a chainable data processing pipeline. A pipeline is a sequence of
named steps, each of which transforms the output of the previous step.

If any step throws, execution stops immediately and the result reflects the
failure — subsequent steps are not run. All step timings and input/output
values are recorded in the result for diagnostics.

Both sync and async step functions are supported.

**Returns** a pipeline builder object with three methods:

### pipeline.addStep(name, fn)

Appends a named step to the pipeline. Returns the pipeline instance for
chaining.

| Parameter | Type       | Description                                                         |
|-----------|------------|---------------------------------------------------------------------|
| `name`    | `string`   | Descriptive label used in execution results and error reporting.     |
| `fn`      | `Function` | Step function. Receives the current pipeline value; should return the next value. May be sync or async. |

**Throws** `Error` if `name` is missing, `fn` is missing, or `fn` is not a function.

### pipeline.execute(input)

Runs all registered steps in order. Returns a `Promise` that always
resolves (never rejects).

| Parameter | Type  | Description                              |
|-----------|-------|------------------------------------------|
| `input`   | `*`   | Initial value passed to the first step.  |

**Resolves with** (on success):

```js
{
  success: true,
  output: any,           // final value after all steps
  steps: [               // per-step details
    { name: string, input: any, output: any, duration: number, success: boolean }
  ],
  executionTime: number  // total ms
}
```

**Resolves with** (on failure):

```js
{
  success: false,
  error: string,         // error message from the failing step
  failedStep: string,    // name of the step that threw
  steps: [               // per-step details up to and including the failure
    { name: string, input: any, error: string, duration: number, success: boolean }
  ],
  executionTime: number
}
```

### pipeline.getSteps()

Returns an ordered array of step names currently registered on the pipeline.
Useful for inspecting pipeline composition before execution.

**Returns** `string[]`

**Example:**

```js
const { createPipeline, csvToJson, normalizeData, exportToJson } = require('./src');

const pipeline = createPipeline()
  .addStep('parse',     (csv)  => csvToJson(csv))
  .addStep('normalize', (rows) => normalizeData(rows, { lowercase: ['email'] }))
  .addStep('export',    (rows) => exportToJson(rows));

pipeline.getSteps();
// ['parse', 'normalize', 'export']

const result = await pipeline.execute('name,email\nAlice,ALICE@EXAMPLE.COM');

if (result.success) {
  console.log(result.output);        // JSON string
  console.log(result.executionTime); // e.g. 3 (ms)
} else {
  console.error(result.failedStep);  // name of the step that threw
  console.error(result.error);
}
```
