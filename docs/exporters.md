# Exporters

Exporters serialise data to JSON-based formats for storage, transport, or
further processing.

---

## exportToJson(data, options?)

Serialises data to a JSON string. The output is always a JSON object with a
`data` key wrapping the (optionally filtered) payload. An optional `metadata`
key can be added alongside it.

**Parameters**

| Name                     | Type      | Default | Description                                                                                                                         |
|--------------------------|-----------|---------|-------------------------------------------------------------------------------------------------------------------------------------|
| `data`                   | `*`       | —       | The value to export. Must not be `null` or `undefined`.                                                                             |
| `options`                | `Object`  | `{}`    | Export options.                                                                                                                     |
| `options.pretty`         | `boolean` | `true`  | Pretty-print with 2-space indentation. Set to `false` for compact JSON.                                                             |
| `options.includeMetadata`| `boolean` | `false` | Append a `metadata` object containing `exportedAt` (ISO timestamp), `recordCount`, and `format: "json"`.                            |
| `options.filterEmpty`    | `boolean` | `false` | Remove empty values. For arrays: removes `null`, `undefined`, and empty-object elements. For objects: removes keys whose value is `null`, `undefined`, or `""`. |

**Returns** `string` — a JSON string with the structure:

```json
{
  "data": <processed data>,
  "metadata": { ... }   // only present when includeMetadata: true
}
```

**Throws** `Error` if `data` is `null` or `undefined`.

```js
const { exportToJson } = require('./src');

// Default (pretty-printed)
exportToJson([{ name: 'Alice' }]);
// '{\n  "data": [\n    {\n      "name": "Alice"\n    }\n  ]\n}'

// Compact with metadata
exportToJson({ a: 1 }, { pretty: false, includeMetadata: true });
// '{"data":{"a":1},"metadata":{"exportedAt":"2024-03-15T10:00:00.000Z","recordCount":1,"format":"json"}}'

// Filter empty values from an array
exportToJson([{ name: 'Alice' }, null, {}], { filterEmpty: true });
// '{\n  "data": [\n    {\n      "name": "Alice"\n    }\n  ]\n}'

// Filter empty keys from an object
exportToJson({ a: 1, b: null, c: '' }, { filterEmpty: true });
// '{\n  "data": {\n    "a": 1\n  }\n}'
```

---

## exportToJsonLines(data)

Serialises an array of values to [JSON Lines](https://jsonlines.org/) (JSONL)
format — a newline-delimited format where each line is a self-contained JSON
value.

JSON Lines is commonly used for streaming data, log files, and large dataset
exports because files can be processed one record at a time without loading
the entire structure into memory.

**Parameters**

| Name   | Type    | Description                                          |
|--------|---------|------------------------------------------------------|
| `data` | `Array` | The array of values to serialise (required). Each element is serialised independently. |

**Returns** `string` — lines joined by `\n`. Each line is the JSON
representation of one element.

**Throws** `Error` if `data` is not an array.

```js
const { exportToJsonLines } = require('./src');

exportToJsonLines([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
// '{"id":1,"name":"Alice"}\n{"id":2,"name":"Bob"}'

// Write to a file (one record per line)
const fs = require('fs');
fs.writeFileSync('output.jsonl', exportToJsonLines(records));
```

---

## parseJsonSafely(jsonString)

Parses a JSON string without throwing on invalid input. Use this instead of
a bare `JSON.parse` when the input is untrusted or may be malformed — the
caller can inspect `success` to branch without a try/catch.

**Parameters**

| Name         | Type     | Description              |
|--------------|----------|--------------------------|
| `jsonString` | `string` | The JSON string to parse. |

**Returns**

| Outcome       | Shape                                      |
|---------------|--------------------------------------------|
| Parse success | `{ success: true, data: any }`             |
| Parse failure | `{ success: false, error: string }`        |

- On success, `data` holds the parsed JavaScript value.
- On failure, `error` holds the underlying `SyntaxError` message.

**Throws** `Error` if `jsonString` is not a string (type error, not a parse
error — the function only catches parse errors).

```js
const { parseJsonSafely } = require('./src');

parseJsonSafely('{"key":"value"}');
// { success: true, data: { key: 'value' } }

parseJsonSafely('[1, 2, 3]');
// { success: true, data: [1, 2, 3] }

parseJsonSafely('not valid json');
// { success: false, error: 'Unexpected token ...' }

parseJsonSafely('{unclosed');
// { success: false, error: '...' }
```
