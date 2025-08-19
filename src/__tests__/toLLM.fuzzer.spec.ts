import { RandomJson } from '@jsonjoy.com/json-random';
import { toLLM } from '../toLLM';

describe('toLLM fuzzer tests', () => {
  let generator: RandomJson;

  beforeEach(() => {
    generator = new RandomJson();
  });

  test('should handle roundtrip for randomly generated objects', () => {
    for (let i = 0; i < 100; i++) {
      generator.create();
      const original = generator.root;
      const llmFormatted = toLLM(original);
      
      // Verify the output is valid JSON
      expect(() => JSON.parse(llmFormatted)).not.toThrow();
      
      // Verify roundtrip compatibility
      const parsed = JSON.parse(llmFormatted);
      expect(parsed).toEqual(original);
    }
  });

  test('should handle roundtrip for randomly generated values with different node counts', () => {
    for (let i = 0; i < 50; i++) {
      // Vary the node count to get different complexity levels
      generator.opts.nodeCount = Math.floor(Math.random() * 20) + 1;
      generator.create();
      const original = generator.root;
      const llmFormatted = toLLM(original);
      
      // Verify the output is valid JSON
      expect(() => JSON.parse(llmFormatted)).not.toThrow();
      
      // Verify roundtrip compatibility
      const parsed = JSON.parse(llmFormatted);
      expect(parsed).toEqual(original);
    }
  });

  test('should handle roundtrip for array-focused structures', () => {
    for (let i = 0; i < 50; i++) {
      // Configure to favor arrays
      generator.opts.rootNode = 'array';
      generator.opts.odds.array = 5;
      generator.opts.odds.object = 1;
      generator.create();
      const original = generator.root;
      const llmFormatted = toLLM(original);
      
      // Verify the output is valid JSON
      expect(() => JSON.parse(llmFormatted)).not.toThrow();
      
      // Verify roundtrip compatibility
      const parsed = JSON.parse(llmFormatted);
      expect(parsed).toEqual(original);
    }
  });

  test('should handle roundtrip for object-focused structures', () => {
    for (let i = 0; i < 50; i++) {
      // Configure to favor objects
      generator.opts.rootNode = 'object';
      generator.opts.odds.object = 5;
      generator.opts.odds.array = 1;
      generator.create();
      const original = generator.root;
      const llmFormatted = toLLM(original);
      
      // Verify the output is valid JSON
      expect(() => JSON.parse(llmFormatted)).not.toThrow();
      
      // Verify roundtrip compatibility
      const parsed = JSON.parse(llmFormatted);
      expect(parsed).toEqual(original);
    }
  });

  test('should handle complex nested structures', () => {
    for (let i = 0; i < 25; i++) {
      // Generate complex nested structures
      generator.opts.nodeCount = 50;
      generator.opts.odds.array = 3;
      generator.opts.odds.object = 3;
      generator.create();
      
      const original = generator.root;
      const llmFormatted = toLLM(original);
      
      // Verify the output is valid JSON
      expect(() => JSON.parse(llmFormatted)).not.toThrow();
      
      // Verify roundtrip compatibility
      const parsed = JSON.parse(llmFormatted);
      expect(parsed).toEqual(original);
    }
  });

  test('should produce token-efficient output while maintaining compatibility', () => {
    for (let i = 0; i < 25; i++) {
      generator.create();
      const original = generator.root;
      const llmFormatted = toLLM(original);
      const standardFormatted = JSON.stringify(original, null, 2);
      
      // Verify roundtrip compatibility
      const parsed = JSON.parse(llmFormatted);
      expect(parsed).toEqual(original);
      
      // Verify token efficiency (LLM format should be more compact)
      expect(llmFormatted.length).toBeLessThanOrEqual(standardFormatted.length);
    }
  });
});