# Validators

Validators check input values and return a result object with a `valid` boolean.

All validators return one of:

```js
{ valid: true, value: <normalized value>, ...extras }
{ valid: false, error: <message> }
```

## validateEmail(email)

Validates an email address.

```js
const { validateEmail } = require('./src');

validateEmail('user@example.com');
// { valid: true, value: 'user@example.com' }

validateEmail('  USER@Example.com  ');
// { valid: true, value: 'user@example.com' }

validateEmail('not-an-email');
// { valid: false, error: 'Invalid email format' }
```

The returned `value` is trimmed and lowercased.

## validatePhone(phone)

Validates a US phone number. Accepts common formatting characters: spaces,
dashes, dots, and parentheses.

```js
const { validatePhone } = require('./src');

validatePhone('(555) 123-4567');
// { valid: true, value: '5551234567', formatted: '(555) 123-4567' }
```

The phone number must be 10 digits after stripping formatting.
