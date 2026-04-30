# Transformers

Transformers convert data between formats and shapes.

## csvToJson(csv)

Converts a CSV string to an array of objects, using the first row as headers.

```js
const { csvToJson } = require('./src');

const csv = 'name,age\nAlice,30\nBob,25';

csvToJson(csv);
// [
//   { name: 'Alice', age: '30' },
//   { name: 'Bob',   age: '25' }
// ]
```

Empty input returns `[]`. Whitespace around values is trimmed. All values are
returned as strings — coerce to numbers/booleans yourself if needed.
