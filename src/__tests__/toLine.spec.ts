import {toLine} from '../toLine';
import {dim} from '../util';

test('prints human readable JSON-like representation', () => {
  const json = [null, true, false, 123, 123.456, 'asdf', [1, 2, 3], {foo: 'bar'}];
  expect(toLine(json)).toBe(
    `[ !n, !t, !f, 123, 123.456, ${dim('"')}asdf${dim('"')}, [ 1, 2, 3 ], { foo ${dim('=')} ${dim('"')}bar${dim('"')} } ]`,
  );
});

describe('string', () => {
  test('formats new line character', () => {
    const json = 'hello\nworld';
    expect(toLine(json)).toBe(`${dim('"')}hello${dim('"')} ⏎ ${dim('"')}world${dim('"')}`);
  });

  test('formats two consecutive new line character', () => {
    const json = 'hello\n\nworld';
    expect(toLine(json)).toBe(`${dim('"')}hello${dim('"')} ⏎ ⏎ ${dim('"')}world${dim('"')}`);
  });

  test('edges of string', () => {
    const json = '\thello\n\nworld\n\t';
    expect(toLine(json)).toBe(`⇥ ${dim('"')}hello${dim('"')} ⏎ ⏎ ${dim('"')}world${dim('"')} ⏎ ⇥`);
  });

  test('ASCII control characters', () => {
    const json = 'a \x00\x01 b \x02\x03 c';
    expect(toLine(json)).toBe(
      `${dim('"')}a ${dim('"')} \\x00 \\x01 ${dim('"')} b ${dim('"')} \\x02 \\x03 ${dim('"')} c${dim('"')}`,
    );
  });
});

describe('binary', () => {
  test('formats Uint8Array as hex octets', () => {
    const json = new Uint8Array([104, 101, 108, 108, 111]);
    expect(toLine(json)).toBe('Uint8Array { 68 65 6C 6C 6F }');
  });

  test('formats Uint32Array as hex words', () => {
    const json = new Uint32Array([0x68656cc, 0x6f]);
    expect(toLine(json)).toBe('Uint32Array { 068656CC 0000006F }');
  });

  test('empty u8a', () => {
    const json = new Uint8Array([]);
    expect(toLine(json)).toBe('Uint8Array {}');
  });
});

describe('number', () => {
  test('integers', () => {
    expect(toLine(1)).toBe('1');
    expect(toLine(1234)).toBe('1,234');
    expect(toLine(1234567)).toBe('1,234,567');
  });

  test('floats', () => {
    expect(toLine(0.1)).toBe('.1');
    // TODO: Fix this.
    // expect(toLine(1234567.89)).toBe('1,234,567.89');
  });

  test('bigints', () => {
    expect(toLine(123n)).toBe('123n');
  });

  test('NaN', () => {
    expect(toLine(Number.NaN)).toBe('NaN');
  });

  test('infinities', () => {
    expect(toLine(Number.POSITIVE_INFINITY)).toBe('∞');
    expect(toLine(Number.NEGATIVE_INFINITY)).toBe('-∞');
  });
});

describe('symbols', () => {
  test('named symbol', () => {
    expect(toLine(Symbol('foo'))).toBe('sym ( foo )');
    expect(toLine(Symbol.for('bar'))).toBe('sym ( bar )');
  });
});
