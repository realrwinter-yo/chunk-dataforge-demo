const { csvToJson } = require('../../src/transformers/csvToJson');

describe('CSV to JSON Transformer', () => {
  describe('basic conversion', () => {
    test('converts simple CSV to JSON array', () => {
      const csv = 'name,age,city\nJohn,30,NYC\nJane,25,LA';
      const result = csvToJson(csv);

      expect(result).toEqual([
        { name: 'John', age: '30', city: 'NYC' },
        { name: 'Jane', age: '25', city: 'LA' }
      ]);
    });

    test('handles single row', () => {
      const csv = 'name,email\nJohn,john@example.com';
      const result = csvToJson(csv);

      expect(result).toEqual([
        { name: 'John', email: 'john@example.com' }
      ]);
    });

    test('handles empty values', () => {
      const csv = 'name,age,city\nJohn,,NYC';
      const result = csvToJson(csv);

      expect(result).toEqual([
        { name: 'John', age: '', city: 'NYC' }
      ]);
    });
  });

  describe('whitespace handling', () => {
    test('trims whitespace from values', () => {
      const csv = 'name,age\n  John  ,  30  ';
      const result = csvToJson(csv);

      expect(result).toEqual([
        { name: 'John', age: '30' }
      ]);
    });

    test('trims whitespace from headers', () => {
      const csv = '  name  ,  age  \nJohn,30';
      const result = csvToJson(csv);

      expect(result).toEqual([
        { name: 'John', age: '30' }
      ]);
    });
  });

  describe('error handling', () => {
    test('returns empty array for empty input', () => {
      expect(csvToJson('')).toEqual([]);
    });

    test('returns empty array for header-only input', () => {
      expect(csvToJson('name,age,city')).toEqual([]);
    });

    test('throws error for null input', () => {
      expect(() => csvToJson(null)).toThrow('CSV input is required');
    });
  });

  describe('options', () => {
    test('uses custom delimiter', () => {
      const csv = 'name;age\nJohn;30';
      const result = csvToJson(csv, { delimiter: ';' });

      expect(result).toEqual([
        { name: 'John', age: '30' }
      ]);
    });
  });
});
