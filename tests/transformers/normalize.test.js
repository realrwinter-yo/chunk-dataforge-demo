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

    test('handles nested uppercase transformations', () => {
      const data = {
        user: {
          code: 'abc123'
        }
      };
      const result = normalizeData(data, { uppercase: ['user.code'] });
      expect(result.user.code).toBe('ABC123');
    });

    test('handles deeply nested objects', () => {
      const data = {
        level1: {
          level2: {
            name: '  Test  '
          }
        }
      };
      const result = normalizeData(data);
      expect(result.level1.level2.name).toBe('Test');
    });

    test('handles null values in nested objects', () => {
      const data = {
        user: {
          name: 'John',
          email: null
        }
      };
      const result = normalizeData(data);
      expect(result.user.name).toBe('John');
      expect(result.user.email).toBeNull();
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

  describe('primitive values', () => {
    test('returns numbers as-is', () => {
      expect(normalizeData(123)).toBe(123);
    });

    test('returns booleans as-is', () => {
      expect(normalizeData(true)).toBe(true);
      expect(normalizeData(false)).toBe(false);
    });

    test('returns strings as-is', () => {
      expect(normalizeData('test')).toBe('test');
    });
  });

  describe('non-string object values', () => {
    test('preserves number values in objects', () => {
      const data = { name: '  John  ', age: 30 };
      const result = normalizeData(data);

      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
    });

    test('preserves boolean values in objects', () => {
      const data = { name: '  John  ', active: true };
      const result = normalizeData(data);

      expect(result.name).toBe('John');
      expect(result.active).toBe(true);
    });
  });
});
