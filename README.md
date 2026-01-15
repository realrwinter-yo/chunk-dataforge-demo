# DataForge

A Node.js data processing utility for validating, transforming, and exporting business data.

## Installation

```bash
npm install
```

## Usage

```javascript
const dataforge = require('./src');

// Validate email
const emailResult = dataforge.validateEmail('user@example.com');

// Convert CSV to JSON
const jsonData = dataforge.csvToJson('name,age\nJohn,30');

// Process data in batches
const result = await dataforge.processBatch(items, transformFn);
```

## Testing

```bash
npm test
```

## License

MIT
