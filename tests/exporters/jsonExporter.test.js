const { exportToJson, exportToJsonLines, parseJsonSafely } = require('../../src/exporters/jsonExporter');

describe('JSON Exporter', () => {
  describe('exportToJson', () => {
    describe('basic export', () => {
      test('exports array data with pretty printing by default', () => {
        const data = [{ id: 1, name: 'Alice' }];
        const result = exportToJson(data);
        const parsed = JSON.parse(result);

        expect(parsed.data).toEqual(data);
        // Pretty-printed JSON contains newlines
        expect(result).toContain('\n');
      });

      test('exports object data', () => {
        const data = { id: 1, name: 'Bob' };
        const result = exportToJson(data);
        const parsed = JSON.parse(result);

        expect(parsed.data).toEqual(data);
      });

      test('exports primitive values', () => {
        const result = exportToJson(42);
        const parsed = JSON.parse(result);

        expect(parsed.data).toBe(42);
      });

      test('exports empty array', () => {
        const result = exportToJson([]);
        const parsed = JSON.parse(result);

        expect(parsed.data).toEqual([]);
      });

      test('exports boolean false without treating it as falsy data', () => {
        const result = exportToJson(false);
        const parsed = JSON.parse(result);

        expect(parsed.data).toBe(false);
      });
    });

    describe('pretty option', () => {
      test('produces compact JSON when pretty is false', () => {
        const data = [{ id: 1 }];
        const result = exportToJson(data, { pretty: false });

        expect(result).not.toContain('\n');
        expect(JSON.parse(result).data).toEqual(data);
      });

      test('produces indented JSON when pretty is true (default)', () => {
        const data = { key: 'value' };
        const result = exportToJson(data, { pretty: true });

        expect(result).toContain('  '); // indentation
        expect(JSON.parse(result).data).toEqual(data);
      });
    });

    describe('includeMetadata option', () => {
      test('omits metadata by default', () => {
        const result = exportToJson([1, 2, 3]);
        const parsed = JSON.parse(result);

        expect(parsed.metadata).toBeUndefined();
      });

      test('includes metadata when includeMetadata is true', () => {
        const data = [{ a: 1 }, { b: 2 }];
        const result = exportToJson(data, { includeMetadata: true });
        const parsed = JSON.parse(result);

        expect(parsed.metadata).toBeDefined();
        expect(parsed.metadata.format).toBe('json');
        expect(parsed.metadata.recordCount).toBe(2);
        expect(parsed.metadata.exportedAt).toBeDefined();
      });

      test('sets recordCount to 1 for non-array data with metadata', () => {
        const data = { name: 'test' };
        const result = exportToJson(data, { includeMetadata: true });
        const parsed = JSON.parse(result);

        expect(parsed.metadata.recordCount).toBe(1);
      });

      test('metadata exportedAt is a valid ISO timestamp', () => {
        const result = exportToJson([1], { includeMetadata: true });
        const parsed = JSON.parse(result);

        expect(() => new Date(parsed.metadata.exportedAt)).not.toThrow();
        expect(new Date(parsed.metadata.exportedAt).toISOString()).toBe(parsed.metadata.exportedAt);
      });
    });

    describe('filterEmpty option', () => {
      test('filters null and undefined items from arrays', () => {
        const data = [{ id: 1 }, null, { id: 3 }, undefined];
        const result = exportToJson(data, { filterEmpty: true });
        const parsed = JSON.parse(result);

        expect(parsed.data).toEqual([{ id: 1 }, { id: 3 }]);
      });

      test('filters empty objects from arrays', () => {
        const data = [{ id: 1 }, {}, { id: 3 }];
        const result = exportToJson(data, { filterEmpty: true });
        const parsed = JSON.parse(result);

        expect(parsed.data).toEqual([{ id: 1 }, { id: 3 }]);
      });

      test('filters null/undefined/empty-string fields from objects', () => {
        const data = { name: 'Alice', age: null, city: undefined, zip: '', country: 'US' };
        const result = exportToJson(data, { filterEmpty: true });
        const parsed = JSON.parse(result);

        expect(parsed.data).toEqual({ name: 'Alice', country: 'US' });
      });

      test('does not filter when filterEmpty is false (default)', () => {
        const data = [null, { id: 1 }, {}];
        const result = exportToJson(data);
        const parsed = JSON.parse(result);

        expect(parsed.data).toHaveLength(3);
      });

      test('keeps zero and false values when filtering object fields', () => {
        const data = { zero: 0, flag: false, name: '' };
        const result = exportToJson(data, { filterEmpty: true });
        const parsed = JSON.parse(result);

        // 0 and false are not null/undefined/'', so they should be kept
        expect(parsed.data.zero).toBe(0);
        expect(parsed.data.flag).toBe(false);
        expect(parsed.data.name).toBeUndefined();
      });
    });

    describe('error handling', () => {
      test('throws for null data', () => {
        expect(() => exportToJson(null)).toThrow('Data is required for export');
      });

      test('throws for undefined data', () => {
        expect(() => exportToJson(undefined)).toThrow('Data is required for export');
      });

      test('throws when called with no arguments', () => {
        expect(() => exportToJson()).toThrow('Data is required for export');
      });
    });
  });

  describe('exportToJsonLines', () => {
    test('converts array to newline-delimited JSON', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = exportToJsonLines(data);
      const lines = result.split('\n');

      expect(lines).toHaveLength(3);
      expect(JSON.parse(lines[0])).toEqual({ id: 1 });
      expect(JSON.parse(lines[1])).toEqual({ id: 2 });
      expect(JSON.parse(lines[2])).toEqual({ id: 3 });
    });

    test('handles empty array', () => {
      const result = exportToJsonLines([]);

      expect(result).toBe('');
    });

    test('handles single-item array', () => {
      const data = [{ name: 'only' }];
      const result = exportToJsonLines(data);

      expect(result).toBe(JSON.stringify({ name: 'only' }));
      expect(result.split('\n')).toHaveLength(1);
    });

    test('serialises each item independently', () => {
      const data = [{ a: 1 }, { b: [1, 2] }, 'string', 42];
      const result = exportToJsonLines(data);
      const lines = result.split('\n');

      expect(JSON.parse(lines[0])).toEqual({ a: 1 });
      expect(JSON.parse(lines[1])).toEqual({ b: [1, 2] });
      expect(JSON.parse(lines[2])).toBe('string');
      expect(JSON.parse(lines[3])).toBe(42);
    });

    test('throws for non-array input', () => {
      expect(() => exportToJsonLines({ a: 1 })).toThrow('Data must be an array for JSON Lines export');
    });

    test('throws for string input', () => {
      expect(() => exportToJsonLines('not an array')).toThrow('Data must be an array for JSON Lines export');
    });

    test('throws for null input', () => {
      expect(() => exportToJsonLines(null)).toThrow('Data must be an array for JSON Lines export');
    });
  });

  describe('parseJsonSafely', () => {
    test('parses valid JSON object', () => {
      const result = parseJsonSafely('{"key":"value"}');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    test('parses valid JSON array', () => {
      const result = parseJsonSafely('[1,2,3]');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });

    test('parses JSON primitives', () => {
      expect(parseJsonSafely('42').data).toBe(42);
      expect(parseJsonSafely('"hello"').data).toBe('hello');
      expect(parseJsonSafely('true').data).toBe(true);
      expect(parseJsonSafely('null').data).toBeNull();
    });

    test('returns failure result for malformed JSON', () => {
      const result = parseJsonSafely('{invalid json}');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    test('returns failure result for empty string', () => {
      const result = parseJsonSafely('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns failure for trailing comma JSON', () => {
      const result = parseJsonSafely('{"a":1,}');

      expect(result.success).toBe(false);
    });

    test('throws for non-string input (number)', () => {
      expect(() => parseJsonSafely(42)).toThrow('Input must be a string');
    });

    test('throws for non-string input (object)', () => {
      expect(() => parseJsonSafely({ key: 'value' })).toThrow('Input must be a string');
    });

    test('throws for null input', () => {
      expect(() => parseJsonSafely(null)).toThrow('Input must be a string');
    });

    test('throws for undefined input', () => {
      expect(() => parseJsonSafely(undefined)).toThrow('Input must be a string');
    });
  });
});
