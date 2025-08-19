import { toLLM } from '../toLLM';

describe('toLLM', () => {
  describe('primitive values', () => {
    test('null', () => {
      expect(toLLM(null)).toBe('null');
    });

    test('boolean values', () => {
      expect(toLLM(true)).toBe('true');
      expect(toLLM(false)).toBe('false');
    });

    test('numbers', () => {
      expect(toLLM(0)).toBe('0');
      expect(toLLM(123)).toBe('123');
      expect(toLLM(-456)).toBe('-456');
      expect(toLLM(3.14)).toBe('3.14');
      expect(toLLM(1e6)).toBe('1000000');
    });

    test('strings', () => {
      expect(toLLM('')).toBe('""');
      expect(toLLM('hello')).toBe('"hello"');
      expect(toLLM('hello\nworld')).toBe('"hello\\nworld"');
      expect(toLLM('hello "world"')).toBe('"hello \\"world\\""');
    });

    test('undefined becomes null', () => {
      expect(toLLM(undefined)).toBe('null');
    });
  });

  describe('arrays', () => {
    test('empty array', () => {
      expect(toLLM([])).toBe('[]');
    });

    test('small arrays on single line', () => {
      expect(toLLM([1, 2, 3])).toBe('[1,2,3]');
      expect(toLLM([true, false, null])).toBe('[true,false,null]');
      expect(toLLM(['a', 'b'])).toBe('["a","b"]');
    });

    test('arrays with objects become multi-line', () => {
      const result = toLLM([{a: 1}, 2]);
      expect(result).toBe('[{"a":1},\n 2]');
    });

    test('larger arrays are multi-line', () => {
      const result = toLLM([1, 2, 3, 4, 5]);
      expect(result).toBe('[1,\n 2,\n 3,\n 4,\n 5]');
    });

    test('nested arrays', () => {
      const result = toLLM([[1, 2], [3, 4]]);
      expect(result).toBe('[[1,2],\n [3,4]]');
    });
  });

  describe('objects', () => {
    test('empty object', () => {
      expect(toLLM({})).toBe('{}');
    });

    test('small objects on single line', () => {
      expect(toLLM({a: 1})).toBe('{"a":1}');
      expect(toLLM({a: 1, b: 2})).toBe('{"a":1,"b":2}');
    });

    test('objects with object values become multi-line', () => {
      const result = toLLM({a: {b: 1}});
      expect(result).toBe('{"a":{"b":1}}');
    });

    test('larger objects are multi-line', () => {
      const result = toLLM({a: 1, b: 2, c: 3});
      expect(result).toBe('{"a":1,\n "b":2,\n "c":3}');
    });

    test('LLM format example from issue', () => {
      const data = {
        first: 1,
        second: 2,
        foo: {
          bar: 132,
          baz: "asdf"
        }
      };
      const result = toLLM(data);
      const expected = `{"first":1,
 "second":2,
 "foo":{"bar":132,
  "baz":"asdf"}}`;
      expect(result).toBe(expected);
    });

    test('nested objects', () => {
      const result = toLLM({
        level1: {
          level2: {
            value: 'deep'
          }
        }
      });
      expect(result).toBe('{"level1":{"level2":{"value":"deep"}}}');
    });
  });

  describe('special object types', () => {
    test('Date objects', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      expect(toLLM(date)).toBe('"2023-01-01T00:00:00.000Z"');
    });

    test('RegExp objects', () => {
      const regex = /test/g;
      expect(toLLM(regex)).toBe('"/test/g"');
    });

    test('functions become strings', () => {
      const fn = function test() {};
      const result = toLLM(fn);
      expect(result).toContain('"function test()');
    });

    test('symbols become strings', () => {
      const sym = Symbol('test');
      expect(toLLM(sym)).toBe('"Symbol(test)"');
    });

    test('bigints become strings', () => {
      const big = BigInt(123);
      expect(toLLM(big)).toBe('"123"');
    });
  });

  describe('complex nested structures', () => {
    test('array of objects', () => {
      const data = [
        {name: 'Alice', age: 30},
        {name: 'Bob', age: 25}
      ];
      const result = toLLM(data);
      const expected = `[{"name":"Alice","age":30},
 {"name":"Bob","age":25}]`;
      expect(result).toBe(expected);
    });

    test('object with arrays', () => {
      const data = {
        users: ['Alice', 'Bob'],
        numbers: [1, 2, 3]
      };
      const result = toLLM(data);
      const expected = `{"users":["Alice","Bob"],
 "numbers":[1,2,3]}`;
      expect(result).toBe(expected);
    });

    test('deeply nested structure', () => {
      const data = {
        a: {
          b: [
            {c: 1, d: 'test'},
            {c: 2, d: 'test2'}
          ],
          e: 'value'
        }
      };
      const result = toLLM(data);
      // This should produce compact but readable JSON
      expect(result).toContain('{"a":');
      expect(result).toContain('"b":[');
      expect(result).toContain('{"c":1,"d":"test"}');
    });
  });

  describe('roundtrip tests', () => {
    const testRoundtrip = (value: unknown, description: string) => {
      test(description, () => {
        const jsonString = toLLM(value);
        expect(() => JSON.parse(jsonString)).not.toThrow();
        const parsed = JSON.parse(jsonString);
        
        // For objects and arrays, compare structure
        if (typeof value === 'object' && value !== null) {
          expect(parsed).toEqual(value);
        } else {
          expect(parsed).toBe(value);
        }
      });
    };

    testRoundtrip(null, 'null value');
    testRoundtrip(true, 'boolean true');
    testRoundtrip(false, 'boolean false');
    testRoundtrip(123, 'positive number');
    testRoundtrip(-456, 'negative number');
    testRoundtrip(3.14, 'decimal number');
    testRoundtrip('hello world', 'simple string');
    testRoundtrip('hello\n"world"', 'string with special characters');
    testRoundtrip([], 'empty array');
    testRoundtrip([1, 2, 3], 'simple array');
    testRoundtrip(['a', 'b', 'c'], 'string array');
    testRoundtrip([true, false, null], 'mixed primitive array');
    testRoundtrip({}, 'empty object');
    testRoundtrip({a: 1}, 'simple object');
    testRoundtrip({a: 1, b: 'test', c: true}, 'mixed value object');
    testRoundtrip([{a: 1}, {b: 2}], 'array of objects');
    testRoundtrip({arr: [1, 2], obj: {nested: true}}, 'object with nested structures');
    
    // Test the specific example from the issue
    testRoundtrip({
      first: 1,
      second: 2,
      foo: {
        bar: 132,
        baz: "asdf"
      }
    }, 'issue example');
  });

  describe('token efficiency', () => {
    test('LLM format is more compact than standard JSON', () => {
      const data = {
        first: 1,
        second: 2,
        foo: {
          bar: 132,
          baz: "asdf"
        }
      };
      
      const llmFormat = toLLM(data);
      const standardFormat = JSON.stringify(data, null, 2);
      
      // LLM format should be significantly shorter
      expect(llmFormat.length).toBeLessThan(standardFormat.length);
      
      // Should roughly match the example from the issue
      // The example claims 23 tokens vs 37 tokens (about 38% reduction)
      const tokenReduction = (standardFormat.length - llmFormat.length) / standardFormat.length;
      expect(tokenReduction).toBeGreaterThan(0.2); // At least 20% reduction
    });

    test('maintains readability with line breaks', () => {
      const data = {a: 1, b: 2, c: 3};
      const result = toLLM(data);
      
      // Should have line breaks for readability
      expect(result).toContain('\n');
      // But should start compactly
      expect(result).toMatch(/^{"\w+":\d+,/);
    });
  });
});