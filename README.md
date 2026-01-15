# DataForge

A comprehensive Node.js data processing utility for validating, transforming, and exporting business data. Built for reliability and ease of use in data-intensive applications.

## Features

- **Validators**: Email, phone, date, and currency validation
- **Transformers**: CSV to JSON conversion and data normalization
- **Processors**: Batch processing and pipeline execution
- **Exporters**: JSON and JSON Lines export with metadata support

## Installation

```bash
npm install
```

## API Reference

### Validators

#### `validateEmail(email)`

Validates and normalizes email addresses.

**Parameters:**
- `email` (string): The email address to validate

**Returns:**
```javascript
// Success
{ valid: true, value: 'user@example.com' }

// Error
{ valid: false, error: 'Invalid email format' }
```

**Example:**
```javascript
const { validateEmail } = require('./src');

const result = validateEmail('User@Example.com');
console.log(result); // { valid: true, value: 'user@example.com' }
```

#### `validatePhone(phone)`

Validates US phone numbers and provides formatted output.

**Parameters:**
- `phone` (string): The phone number to validate (accepts various formats)

**Returns:**
```javascript
// Success
{
  valid: true,
  value: '5551234567',
  formatted: '(555) 123-4567'
}

// Error
{ valid: false, error: 'Phone number must be 10 digits' }
```

**Example:**
```javascript
const { validatePhone } = require('./src');

const result = validatePhone('(555) 123-4567');
console.log(result.formatted); // '(555) 123-4567'
```

#### `validateDate(dateStr)`

Validates dates in multiple formats (ISO: YYYY-MM-DD, US: MM/DD/YYYY, European: DD.MM.YYYY).

**Parameters:**
- `dateStr` (string): The date string to validate

**Returns:**
```javascript
// Success
{
  valid: true,
  value: '2024-03-15',
  parsed: Date object
}

// Error
{ valid: false, error: 'Invalid date format' }
```

**Example:**
```javascript
const { validateDate } = require('./src');

const result = validateDate('03/15/2024');
console.log(result.value); // '2024-03-15'
```

#### `validateCurrency(value)`

Validates and formats currency values (USD).

**Parameters:**
- `value` (string|number): The currency value to validate

**Returns:**
```javascript
// Success
{
  valid: true,
  value: 1234.56,
  formatted: '$1,234.56'
}

// Error
{ valid: false, error: 'Negative values are not allowed' }
```

**Example:**
```javascript
const { validateCurrency } = require('./src');

const result = validateCurrency('$1,234.56');
console.log(result.formatted); // '$1,234.56'
```

### Transformers

#### `csvToJson(csv, options)`

Converts CSV strings to JSON arrays.

**Parameters:**
- `csv` (string): The CSV string to convert
- `options` (object, optional):
  - `delimiter` (string): Column delimiter (default: ',')

**Returns:** Array of objects

**Example:**
```javascript
const { csvToJson } = require('./src');

const csv = 'name,age,city\nJohn,30,NYC\nJane,25,LA';
const result = csvToJson(csv);
// [
//   { name: 'John', age: '30', city: 'NYC' },
//   { name: 'Jane', age: '25', city: 'LA' }
// ]
```

#### `normalizeData(data, options)`

Normalizes data by trimming strings and applying case transformations.

**Parameters:**
- `data` (any): The data to normalize (supports objects, arrays, and primitives)
- `options` (object, optional):
  - `lowercase` (array): Field names to convert to lowercase
  - `uppercase` (array): Field names to convert to uppercase

**Returns:** Normalized data (same structure as input)

**Example:**
```javascript
const { normalizeData } = require('./src');

const data = { name: '  John  ', email: 'JOHN@EXAMPLE.COM' };
const result = normalizeData(data, { lowercase: ['email'] });
// { name: 'John', email: 'john@example.com' }
```

### Processors

#### `processBatch(items, transform, options)`

Processes arrays of items with error handling and progress tracking.

**Parameters:**
- `items` (array): Items to process
- `transform` (function): Transform function (sync or async)
- `options` (object, optional):
  - `batchSize` (number): Batch size for progress callbacks (default: 10)
  - `onProgress` (function): Progress callback function

**Returns:** Promise resolving to:
```javascript
{
  successful: [...],
  failed: [{ item, error, index }],
  stats: {
    total: number,
    succeeded: number,
    failed: number
  }
}
```

**Example:**
```javascript
const { processBatch } = require('./src');

const items = [1, 2, 3, 4, 5];
const transform = async (item) => item * 2;

const result = await processBatch(items, transform, {
  onProgress: ({ processed, total, percentage }) => {
    console.log(`Progress: ${percentage}%`);
  }
});

console.log(result.successful); // [2, 4, 6, 8, 10]
```

#### `createPipeline()`

Creates a fluent data processing pipeline.

**Returns:** Pipeline builder object with methods:
- `addStep(name, fn)`: Adds a processing step
- `execute(input)`: Executes the pipeline
- `getSteps()`: Returns array of step names

**Example:**
```javascript
const { createPipeline } = require('./src');

const pipeline = createPipeline()
  .addStep('parse', (data) => JSON.parse(data))
  .addStep('transform', (data) => ({ ...data, processed: true }))
  .addStep('validate', (data) => {
    if (!data.id) throw new Error('ID required');
    return data;
  });

const result = await pipeline.execute('{"id": 1}');
// {
//   success: true,
//   output: { id: 1, processed: true },
//   steps: [...],
//   executionTime: 5
// }
```

### Exporters

#### `exportToJson(data, options)`

Exports data to JSON format with optional metadata.

**Parameters:**
- `data` (any): Data to export
- `options` (object, optional):
  - `pretty` (boolean): Pretty print output (default: true)
  - `includeMetadata` (boolean): Include export metadata (default: false)
  - `filterEmpty` (boolean): Filter empty values (default: false)

**Returns:** JSON string

**Example:**
```javascript
const { exportToJson } = require('./src');

const data = [{ id: 1, name: 'John' }];
const json = exportToJson(data, { includeMetadata: true });
```

#### `exportToJsonLines(data)`

Exports array to JSON Lines format (newline-delimited JSON).

**Parameters:**
- `data` (array): Array of objects to export

**Returns:** String with one JSON object per line

**Example:**
```javascript
const { exportToJsonLines } = require('./src');

const data = [{ id: 1 }, { id: 2 }];
const jsonl = exportToJsonLines(data);
// '{"id":1}\n{"id":2}'
```

#### `parseJsonSafely(jsonString)`

Safely parses JSON with error handling.

**Parameters:**
- `jsonString` (string): JSON string to parse

**Returns:**
```javascript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: 'error message' }
```

**Example:**
```javascript
const { parseJsonSafely } = require('./src');

const result = parseJsonSafely('{"valid": true}');
if (result.success) {
  console.log(result.data);
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Development

Lint the codebase:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

## License

MIT
