const { normalizeData } = require('../../src/transformers/normalize');

describe('Data Normalizer', () => {
  describe('string normalization', () => {
    test('trims whitespace', () => {
      const data = { name: '  John Doe  ' };
      const result = normalizeData(data);
      expect(result.name).toBe('John Doe');
    });

    test('normalizes multiple spaces', () => {
      const data = { name: 'John    Doe' };
      const result = normalizeData(data);
      expect(result.name).toBe('John Doe');
    });
  });

  describe('case normalization', () => {
    test('converts specified fields to lowercase', () => {
      const data = { email: 'USER@EXAMPLE.COM' };
      const result = normalizeData(data, { lowercase: ['email'] });
      expect(result.email).toBe('user@example.com');
    });

    test('converts specified fields to uppercase', () => {
      const data = { code: 'abc123' };
      const result = normalizeData(data, { uppercase: ['code'] });
      expect(result.code).toBe('ABC123');
    });
  });

  describe('nested objects', () => {
    test('normalizes nested object fields', () => {
      const data = {
        user: {
          name: '  John  ',
          email: 'JOHN@EXAMPLE.COM'
        }
      };
      const result = normalizeData(data, { lowercase: ['user.email'] });
      expect(result.user.name).toBe('John');
      expect(result.user.email).toBe('john@example.com');
    });
  });

  describe('array handling', () => {
    test('normalizes arrays of objects', () => {
      const data = [
        { name: '  John  ' },
        { name: '  Jane  ' }
      ];
      const result = normalizeData(data);
      expect(result).toEqual([
        { name: 'John' },
        { name: 'Jane' }
      ]);
    });
  });

  describe('error handling', () => {
    test('returns null for null input', () => {
      expect(normalizeData(null)).toBeNull();
    });

    test('returns undefined for undefined input', () => {
      expect(normalizeData(undefined)).toBeUndefined();
    });
  });
});
