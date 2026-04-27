const { normalizeData } = require('../../src/transformers/normalize');

describe('Data Normalizer – additional coverage', () => {
  describe('primitive passthrough', () => {
    test('returns number unchanged', () => {
      expect(normalizeData(42)).toBe(42);
    });

    test('returns boolean unchanged', () => {
      expect(normalizeData(true)).toBe(true);
      expect(normalizeData(false)).toBe(false);
    });

    test('returns string unchanged (top-level primitive)', () => {
      // Top-level strings are not objects/arrays, returned as-is
      expect(normalizeData('hello')).toBe('hello');
    });
  });

  describe('array of primitives', () => {
    test('normalizes array of numbers (passthrough)', () => {
      expect(normalizeData([1, 2, 3])).toEqual([1, 2, 3]);
    });

    test('normalizes mixed primitive array', () => {
      expect(normalizeData([1, true, 'a'])).toEqual([1, true, 'a']);
    });
  });

  describe('uppercase on nested fields', () => {
    test('applies uppercase to nested field via dot notation', () => {
      const data = {
        address: {
          state: 'ny',
          country: 'us'
        }
      };
      const result = normalizeData(data, { uppercase: ['address.state', 'address.country'] });

      expect(result.address.state).toBe('NY');
      expect(result.address.country).toBe('US');
    });

    test('applies lowercase and uppercase to different nested fields', () => {
      const data = {
        user: {
          name: 'alice',
          id: 'abc123'
        }
      };
      const result = normalizeData(data, {
        uppercase: ['user.id'],
        lowercase: ['user.name']
      });

      expect(result.user.name).toBe('alice');
      expect(result.user.id).toBe('ABC123');
    });
  });

  describe('whitespace normalization in objects', () => {
    test('collapses leading/trailing whitespace in deeply nested strings', () => {
      const data = { level1: { level2: { value: '  hello   world  ' } } };
      const result = normalizeData(data);

      expect(result.level1.level2.value).toBe('hello world');
    });
  });

  describe('object with non-string primitive values', () => {
    test('passes through numeric values in objects unchanged', () => {
      const data = { count: 5, ratio: 0.75 };
      const result = normalizeData(data);

      expect(result.count).toBe(5);
      expect(result.ratio).toBe(0.75);
    });

    test('passes through boolean values in objects unchanged', () => {
      const data = { active: true, deleted: false };
      const result = normalizeData(data);

      expect(result.active).toBe(true);
      expect(result.deleted).toBe(false);
    });

    test('preserves null values within objects', () => {
      const data = { name: 'Alice', middleName: null };
      const result = normalizeData(data);

      expect(result.middleName).toBeNull();
    });
  });

  describe('array of objects with case options', () => {
    test('normalizes array items with case option applied to each element', () => {
      const data = [
        { email: 'ALICE@EXAMPLE.COM' },
        { email: 'BOB@EXAMPLE.COM' }
      ];
      const result = normalizeData(data, { lowercase: ['email'] });

      expect(result[0].email).toBe('alice@example.com');
      expect(result[1].email).toBe('bob@example.com');
    });
  });

  describe('non-conflicting case options', () => {
    test('field listed in both lowercase and uppercase applies uppercase last', () => {
      // Both lowercase and uppercase are applied sequentially; uppercase wins
      const data = { code: 'AbCd' };
      const result = normalizeData(data, { lowercase: ['code'], uppercase: ['code'] });

      expect(result.code).toBe('ABCD');
    });
  });
});
