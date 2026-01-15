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

    test('throws error for undefined input', () => {
      expect(() => csvToJson(undefined)).toThrow('CSV input is required');
    });

    test('throws error for non-string input', () => {
      expect(() => csvToJson(123)).toThrow('CSV input must be a string');
    });

    test('throws error for object input', () => {
      expect(() => csvToJson({ foo: 'bar' })).toThrow('CSV input must be a string');
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

  describe('edge cases', () => {
    test('skips empty lines in data', () => {
      const csv = 'name,age\nJohn,30\n\nJane,25\n\n';
      const result = csvToJson(csv);

      expect(result).toEqual([
        { name: 'John', age: '30' },
        { name: 'Jane', age: '25' }
      ]);
    });

    test('handles whitespace-only input', () => {
      expect(csvToJson('   ')).toEqual([]);
    });

    test('handles missing values at end of row', () => {
      const csv = 'name,age,city\nJohn,30';
      const result = csvToJson(csv);

      expect(result).toEqual([
        { name: 'John', age: '30', city: '' }
      ]);
    });

    test('handles rows with more values than headers', () => {
      const csv = 'name,age\nJohn,30,extra,data';
      const result = csvToJson(csv);

      // Should only map values to existing headers
      expect(result).toEqual([
        { name: 'John', age: '30' }
      ]);
    });

    test('handles newline-only CSV', () => {
      const csv = '\n\n\n';
      const result = csvToJson(csv);
      expect(result).toEqual([]);
    });

    test('handles CSV with only header and newlines', () => {
      const csv = 'name,age\n\n\n';
      const result = csvToJson(csv);
      expect(result).toEqual([]);
    });

    test('handles tab delimiter', () => {
      const csv = 'name\tage\nJohn\t30';
      const result = csvToJson(csv, { delimiter: '\t' });
      expect(result).toEqual([
        { name: 'John', age: '30' }
      ]);
    });

    test('handles pipe delimiter', () => {
      const csv = 'name|age|city\nJohn|30|NYC';
      const result = csvToJson(csv, { delimiter: '|' });
      expect(result).toEqual([
        { name: 'John', age: '30', city: 'NYC' }
      ]);
    });
  });
});
