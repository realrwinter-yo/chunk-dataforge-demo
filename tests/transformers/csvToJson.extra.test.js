const { csvToJson } = require('../../src/transformers/csvToJson');

describe('CSV to JSON Transformer – additional coverage', () => {
  describe('invalid input types', () => {
    test('throws for undefined input', () => {
      expect(() => csvToJson(undefined)).toThrow('CSV input is required');
    });

    test('throws for numeric input', () => {
      expect(() => csvToJson(123)).toThrow('CSV input must be a string');
    });

    test('throws for array input', () => {
      expect(() => csvToJson(['a', 'b'])).toThrow('CSV input must be a string');
    });

    test('throws for object input', () => {
      expect(() => csvToJson({ a: 1 })).toThrow('CSV input must be a string');
    });
  });

  describe('blank lines in body', () => {
    test('skips blank lines between data rows', () => {
      const csv = 'name,age\nAlice,30\n\nBob,25';
      const result = csvToJson(csv);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'Alice', age: '30' });
      expect(result[1]).toEqual({ name: 'Bob', age: '25' });
    });

    test('skips whitespace-only lines', () => {
      const csv = 'name,age\nAlice,30\n   \nBob,25';
      const result = csvToJson(csv);

      expect(result).toHaveLength(2);
    });
  });

  describe('row with fewer values than headers', () => {
    test('fills missing values with empty string', () => {
      const csv = 'name,age,city\nAlice,30';
      const result = csvToJson(csv);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
      expect(result[0].age).toBe('30');
      expect(result[0].city).toBe('');
    });
  });

  describe('whitespace-only CSV', () => {
    test('returns empty array for whitespace-only string', () => {
      expect(csvToJson('   ')).toEqual([]);
    });
  });

  describe('tab delimiter', () => {
    test('uses tab as delimiter when specified', () => {
      const csv = 'name\tage\nAlice\t30';
      const result = csvToJson(csv, { delimiter: '\t' });

      expect(result).toEqual([{ name: 'Alice', age: '30' }]);
    });
  });

  describe('pipe delimiter', () => {
    test('uses pipe as delimiter when specified', () => {
      const csv = 'name|city\nAlice|NYC';
      const result = csvToJson(csv, { delimiter: '|' });

      expect(result).toEqual([{ name: 'Alice', city: 'NYC' }]);
    });
  });

  describe('multiple rows', () => {
    test('converts many rows correctly', () => {
      const rows = Array.from({ length: 5 }, (_, i) => `Name${i},${i * 10}`);
      const csv = 'name,score\n' + rows.join('\n');
      const result = csvToJson(csv);

      expect(result).toHaveLength(5);
      expect(result[4]).toEqual({ name: 'Name4', score: '40' });
    });
  });
});
