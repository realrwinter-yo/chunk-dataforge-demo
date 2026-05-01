# Transformers

Transformers convert data between formats and shapes.

---

## csvToJson(csv, options?)

Converts a CSV string into an array of plain objects, using the first row
as headers. Subsequent lines are data rows; blank lines are skipped.
All keys and values are trimmed of surrounding whitespace. All values are
returned as **strings** — coerce to numbers, booleans, or other types
yourself if needed.

Does not currently support quoted fields that span multiple lines or that
contain the delimiter character.

**Parameters**

| Name               | Type     | Default | Description                                   |
|--------------------|----------|---------|-----------------------------------------------|
| `csv`              | `string` | —       | The CSV string to parse (required)             |
| `options`          | `Object` | `{}`    | Optional parsing options                       |
| `options.delimiter`| `string` | `','`   | Field separator. Override for TSV or other delimited formats (e.g. `'\t'`). |

**Returns** `Object[]` — one object per data row. Returns `[]` for empty
input or a header-only CSV.

**Throws** `Error` if `csv` is `null`, `undefined`, or not a string.

```js
const { csvToJson } = require('./src');

const csv = 'name,age\nAlice,30\nBob,25';

csvToJson(csv);
// [
//   { name: 'Alice', age: '30' },
//   { name: 'Bob',   age: '25' }
// ]

// TSV example
csvToJson('a\tb\tc\n1\t2\t3', { delimiter: '\t' });
// [{ a: '1', b: '2', c: '3' }]

// Empty input
csvToJson('');
// []

// Header-only
csvToJson('name,age');
// []
```

---

## normalizeData(data, options?)

Recursively normalises data by trimming strings and applying optional case
transformations to named fields.

**Behaviour by type:**

| Input type | Behaviour |
|------------|-----------|
| `string`   | Trimmed; internal runs of whitespace collapsed to one space; optionally lower/upper-cased based on `options`. |
| `Array`    | Each element is normalised recursively with the same options. |
| `Object`   | Each value is normalised recursively; dot notation in `options.lowercase` / `options.uppercase` targets nested fields (e.g. `"address.city"`). |
| Primitives (`null`, `undefined`, numbers, booleans) | Returned as-is. |

The function does **not** mutate the original data; it returns a new
structure with the same shape.

**Parameters**

| Name                | Type       | Default | Description                                                                                              |
|---------------------|------------|---------|----------------------------------------------------------------------------------------------------------|
| `data`              | `*`        | —       | The value to normalise (object, array, primitive, or null).                                              |
| `options`           | `Object`   | `{}`    | Normalisation options.                                                                                   |
| `options.lowercase` | `string[]` | `[]`    | Field names whose string values should be converted to lower case. Supports dot notation for nested fields (e.g. `['email', 'address.country']`). |
| `options.uppercase` | `string[]` | `[]`    | Field names whose string values should be converted to upper case. Applied after `lowercase` if both include the same key. |

**Returns** `*` — A new normalised value with the same structural type as
`data`.

```js
const { normalizeData } = require('./src');

// Trim and lowercase a field
normalizeData(
  { name: '  Alice  ', email: 'ALICE@EXAMPLE.COM' },
  { lowercase: ['email'] }
);
// { name: 'Alice', email: 'alice@example.com' }

// Uppercase a field in an array of objects
normalizeData(
  [{ code: 'us' }, { code: 'gb' }],
  { uppercase: ['code'] }
);
// [{ code: 'US' }, { code: 'GB' }]

// Dot notation for nested objects
normalizeData(
  { address: { city: 'new york' } },
  { uppercase: ['address.city'] }
);
// { address: { city: 'NEW YORK' } }

// Primitives pass through unchanged
normalizeData(42);
// 42
```
