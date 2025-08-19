/**
 * LLM-friendly JSON formatter that minimizes token usage while maintaining readability.
 *
 * Key optimizations:
 * - First item on same line as opening brace/bracket
 * - Single space indentation
 * - No spaces around : and , separators
 * - Trailing braces on last line
 * - Small objects/arrays on single line
 */

const isSmallValue = (value: unknown, context: 'root' | 'array-item' | 'object-prop' = 'root'): boolean => {
  if (value === null || typeof value !== 'object') return true;

  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    if (value.length <= 3) {
      return value.every((item) => typeof item !== 'object' || item === null);
    }
    return false;
  }

  if (value instanceof Date || value instanceof RegExp) return true;

  const keys = Object.keys(value);
  if (keys.length === 0) return true;

  // Different rules based on context:
  // - root: objects with ≤2 primitive properties can be single line
  // - array-item: objects with primitive properties can be single line (regardless of count)
  // - object-prop: objects with >1 property become multi-line
  const allPrimitive = keys.every((key) => {
    const val = (value as Record<string, unknown>)[key];
    return typeof val !== 'object' || val === null;
  });

  if (!allPrimitive) return false;

  if (context === 'array-item') return true; // All primitive objects in arrays are single-line
  if (context === 'object-prop') return keys.length <= 1; // Nested in object: only single property stays single-line
  return keys.length <= 2; // Root level: up to 2 properties can be single-line
};

const formatValue = (
  value: unknown,
  indent: string = '',
  context: 'root' | 'array-item' | 'object-prop' = 'root',
): string => {
  // Handle primitives
  if (value === null) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'undefined') return 'null'; // JSON doesn't support undefined

  // Handle non-standard types by converting to string representation
  if (typeof value === 'bigint') return JSON.stringify(String(value));
  if (typeof value === 'symbol') return JSON.stringify(String(value));
  if (typeof value === 'function') return JSON.stringify(String(value));

  // Handle special objects
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (value instanceof RegExp) return JSON.stringify(value.toString());

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';

    // Small arrays on single line
    if (isSmallValue(value, context)) {
      return JSON.stringify(value);
    }

    // Multi-line arrays: first item on same line, others indented
    const newIndent = indent + ' ';
    const items = value.map((item) => formatValue(item, newIndent, 'array-item'));
    return '[' + items[0] + (items.length > 1 ? ',\n' + newIndent + items.slice(1).join(',\n' + newIndent) : '') + ']';
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';

    // Small objects on single line
    if (isSmallValue(value, context)) {
      return JSON.stringify(value);
    }

    // Multi-line objects: first property on same line, others indented
    const newIndent = indent + ' ';
    const pairs = keys.map((key) => {
      const keyStr = JSON.stringify(key);
      const valStr = formatValue((value as Record<string, unknown>)[key], newIndent, 'object-prop');
      return keyStr + ':' + valStr;
    });

    return '{' + pairs[0] + (pairs.length > 1 ? ',\n' + newIndent + pairs.slice(1).join(',\n' + newIndent) : '') + '}';
  }

  // Fallback for unknown types
  return JSON.stringify(String(value));
};

/**
 * Converts a JavaScript value to LLM-friendly JSON string.
 *
 * The output is valid JSON that can be parsed back with JSON.parse(),
 * but formatted to minimize token usage while remaining human-readable.
 *
 * @param value - The value to convert to JSON
 * @returns LLM-optimized JSON string
 */
export const toLLM = (value: unknown): string => {
  return formatValue(value, '', 'root');
};
