# Validators

Validators check input values and return a result object with a `valid` boolean.

All validators return one of:

```js
{ valid: true, value: <normalized value>, ...extras }
{ valid: false, error: <message> }
```

---

## validateEmail(email)

Validates an email address. The input is trimmed and lowercased before the
format check, so the returned `value` is always normalised. A basic
`local@domain.tld` pattern is enforced — DNS / deliverability is not checked.

**Parameters**

| Name    | Type     | Description              |
|---------|----------|--------------------------|
| `email` | `string` | Raw email address to validate |

**Returns**

| Outcome | Shape |
|---------|-------|
| Valid   | `{ valid: true, value: string }` |
| Invalid | `{ valid: false, error: string }` |

```js
const { validateEmail } = require('./src');

validateEmail('User@Example.com');
// { valid: true, value: 'user@example.com' }

validateEmail('  USER@Example.com  ');
// { valid: true, value: 'user@example.com' }

validateEmail('not-an-email');
// { valid: false, error: 'Invalid email format' }

validateEmail('');
// { valid: false, error: 'Email is required' }
```

---

## validatePhone(phone)

Validates a US phone number. Accepts common formatting characters — spaces,
dashes, dots, and parentheses — in addition to digits. After stripping all
non-digit characters the number must be exactly 10 digits. 11-digit numbers
(country code `1` prefix) are **not** currently supported.

**Parameters**

| Name    | Type     | Description                    |
|---------|----------|--------------------------------|
| `phone` | `string` | Raw phone number string to validate |

**Returns**

| Outcome | Shape |
|---------|-------|
| Valid   | `{ valid: true, value: string, formatted: string }` |
| Invalid | `{ valid: false, error: string }` |

- `value` — 10-digit string with no formatting (e.g. `"5551234567"`)
- `formatted` — standard US format (e.g. `"(555) 123-4567"`)

```js
const { validatePhone } = require('./src');

validatePhone('(555) 123-4567');
// { valid: true, value: '5551234567', formatted: '(555) 123-4567' }

validatePhone('555.123.4567');
// { valid: true, value: '5551234567', formatted: '(555) 123-4567' }

validatePhone('123');
// { valid: false, error: 'Phone number must be 10 digits' }

validatePhone('555-123-456A');
// { valid: false, error: 'Phone number contains invalid characters' }
```

---

## validateDate(dateStr)

Validates a date string in one of three supported formats:

| Format      | Pattern        | Example          |
|-------------|----------------|------------------|
| ISO 8601    | `YYYY-MM-DD`   | `"2024-03-15"`   |
| US          | `MM/DD/YYYY`   | `"03/15/2024"`   |
| European    | `DD.MM.YYYY`   | `"15.03.2024"`   |

Month and day ranges are validated against their calendar maximums. Leap
years are **not** accounted for — `29 Feb` is always rejected because
February's max is fixed at 28.

**Parameters**

| Name      | Type     | Description            |
|-----------|----------|------------------------|
| `dateStr` | `string` | Raw date string to validate |

**Returns**

| Outcome | Shape |
|---------|-------|
| Valid   | `{ valid: true, value: string, parsed: Date }` |
| Invalid | `{ valid: false, error: string }` |

- `value`  — normalised ISO 8601 string (`"YYYY-MM-DD"`)
- `parsed` — JavaScript `Date` object (local time, midnight)

```js
const { validateDate } = require('./src');

validateDate('2024-03-15');
// { valid: true, value: '2024-03-15', parsed: Date }

validateDate('03/15/2024');
// { valid: true, value: '2024-03-15', parsed: Date }

validateDate('15.03.2024');
// { valid: true, value: '2024-03-15', parsed: Date }

validateDate('2024-13-01');
// { valid: false, error: 'Invalid month' }

validateDate('not-a-date');
// { valid: false, error: 'Invalid date format' }
```

---

## validateCurrency(value)

Validates and normalises a currency value (USD). Accepts numeric values as
strings or numbers. An optional leading `$` and thousands separators (`,`)
are stripped before parsing. Negative values and non-numeric input are
rejected.

The formatted output always uses a `$` prefix, two decimal places, and
comma-separated thousands for values ≥ 1000.

**Parameters**

| Name    | Type              | Description                                             |
|---------|-------------------|---------------------------------------------------------|
| `value` | `string\|number`  | Currency value. May include a leading `$` and commas (e.g. `"$1,234.56"`). |

**Returns**

| Outcome | Shape |
|---------|-------|
| Valid   | `{ valid: true, value: number, formatted: string }` |
| Invalid | `{ valid: false, error: string }` |

- `value`     — parsed floating-point number (e.g. `1234.56`)
- `formatted` — display string (e.g. `"$1,234.56"`)

```js
const { validateCurrency } = require('./src');

validateCurrency('$1,234.56');
// { valid: true, value: 1234.56, formatted: '$1,234.56' }

validateCurrency(9.99);
// { valid: true, value: 9.99, formatted: '$9.99' }

validateCurrency('1000');
// { valid: true, value: 1000, formatted: '$1,000.00' }

validateCurrency('-5.00');
// { valid: false, error: 'Negative values are not allowed' }

validateCurrency('abc');
// { valid: false, error: 'Invalid currency format' }
```
