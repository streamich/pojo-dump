import {toTree} from '../toTree';
import {dim} from '../util';

test('can format primitive values', () => {
  expect(toTree(null)).toBe('!n');
  expect(toTree(true)).toBe('!t');
  expect(toTree(false)).toBe('!f');
  expect(toTree(123)).toBe('123');
  expect(toTree(-3.14)).toBe('-3.14');
  expect(toTree('')).toBe('""');
  expect(toTree('abc')).toBe(`${dim('"')}abc${dim('"')}`);
});

test('can format simple array', () => {
  expect(toTree([1, 2, 3])).toMatchInlineSnapshot(`
"╿
├─ [0]: 1
├─ [1]: 2
└─ [2]: 3"
`);
});

test('can format empty array', () => {
  expect(toTree([])).toMatchInlineSnapshot(`"[]"`);
});

test('can format simple object', () => {
  expect(toTree({foo: 'bar'})).toMatchInlineSnapshot(`
"╿
└─ foo = "bar""
`);
});

test('can format empty object', () => {
  expect(toTree({foo: {}})).toMatchInlineSnapshot(`
"╿
└─ foo = {}"
`);
});

test('can format empty array', () => {
  expect(toTree({foo: []})).toMatchInlineSnapshot(`
"╿
└─ foo = []"
`);
});

test('object in array', () => {
  const formatted = toTree([{foo: 'bar'}], '', '');
  expect(formatted).toMatchInlineSnapshot(`"└─ [0]: { foo = "bar" }"`);
});

test('can format complex object', () => {
  const formatted = toTree([{foo: 'bar'}, {key: [1, 2, null, true, false]}], '', '');
  expect(formatted).toMatchInlineSnapshot(`
"├─ [0]: { foo = "bar" }
└─ [1]
    └─ key
       ├─ [0]: 1
       ├─ [1]: 2
       ├─ [2]: !n
       ├─ [3]: !t
       └─ [4]: !f"
`);
});

test('can print instance of Date', () => {
  const pojo = {foo: new Date(1752922409243)};
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ foo = Date { 1752922409243 }"
`);
});

test('can print instance of RegExp', () => {
  const pojo = {foo: /abc/, bar: [/xyz/]};
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
├─ foo = /abc/
└─ bar = [ /xyz/ ]"
`);
});

test('can wrap long object values', () => {
  const pojo = {
    foo: 'bar',
    longValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    x: 123,
  };
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
├─ foo = "bar"
├─ longValue = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod t ↵
│              empor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam ↵
│              , quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo  ↵
│              consequat."
└─ x = 123"
`);
});

test('can wrap long object keys', () => {
  const pojo = {
    foo: 'bar',
    thisIsAVeryVeryVeryLongKeyThatNeedsWrappingBecauseItIsWayTooLong:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    x: 123,
  };
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
├─ foo = "bar"
├─ thisIsAVeryVeryVeryLongKeyThatNeedsWrap ↵
│  pingBecauseItIsWayTooLong = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.  ↵
│                              Sed do eiusmod tempor incididunt ut labore et dolore magna ↵
│                               aliqua. Ut enim ad minim veniam, quis nostrud exercitatio ↵
│                              n ullamco laboris nisi ut aliquip ex ea commodo consequat. ↵
│                              "
└─ x = 123"
`);
});

test('can wrap long array values', () => {
  const pojo = [
    'bar',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    123,
  ];
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
├─ [0]: "bar"
├─ [1]: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor i ↵
│       ncididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud ↵
│        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
└─ [2]: 123"
`);
});

test('can print instance of Map', () => {
  const pojo = new Map<any, any>([
    ['foo', 'bar'],
    ['longKey', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod'],
    ['x', 123],
    [null, 'null'],
    [undefined, 'undefined'],
    [true, 'true'],
    [false, 'false'],
    [123, 'number'],
    [0.1, 'float'],
    ['string', 'string'],
    [/abc/, 'regexp'],
    [new Date(1752922409243), 'date'],
  ]);
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ Map {}
   ├─ foo = "bar"
   ├─ longKey = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod"
   ├─ x = 123
   ├─ !n = "null"
   ├─ !u = "undefined"
   ├─ !t = "true"
   ├─ !f = "false"
   ├─ 123 = "number"
   ├─ .1 = "float"
   ├─ string = "string"
   ├─ /abc/ = "regexp"
   └─ Date { 1752922409243 } = "date""
`);
});

test('can print instance of Map - 2', () => {
  const pojo = {
    foo: new Map<string, any>([
      ['foo', 'bar'],
      ['longKey', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod'],
      ['x', 123],
    ]),
  };
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ foo
   └─ Map {}
      ├─ foo = "bar"
      ├─ longKey = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusm ↵
      │            od"
      └─ x = 123"
`);
});

test('can print instance of Map - 3', () => {
  const pojo = [
    1,
    [
      new Map<string, any>([
        ['foo', 'bar'],
        ['longKey', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod'],
        ['x', 123],
      ]),
    ],
    3,
  ];
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
├─ [0]: 1
├─ [1]
│   └─ [0]
│       └─ Map {}
│          ├─ foo = "bar"
│          ├─ longKey = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do  ↵
│          │            eiusmod"
│          └─ x = 123
└─ [2]: 3"
`);
});

test('can print empty Map', () => {
  const pojo = new Map();
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ Map {}"
`);
});

test('can print instance of Set', () => {
  const pojo = {
    thisIsASet: new Set<any>([
      'foo',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      123,
      new Map<any, any>([
        ['foo', 'bar'],
        ['longKey', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod'],
        ['x', 123],
      ]),
      true,
      false,
      [null, undefined, 0.123],
    ]),
  };
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ thisIsASet
   └─ Set {}
      ├─ [0]: "foo"
      ├─ [1]: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod te ↵
      │       mpor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,  ↵
      │       quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo con ↵
      │       sequat."
      ├─ [2]: 123
      ├─ [3]
      │   └─ Map {}
      │      ├─ foo = "bar"
      │      ├─ longKey = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed d ↵
      │      │            o eiusmod"
      │      └─ x = 123
      ├─ [4]: !t
      ├─ [5]: !f
      └─ [6]: [ !n, !u, .123 ]"
`);
});

test('can print empty Set', () => {
  const pojo = new Set();
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ Set {}"
`);
});

test('can print small Set', () => {
  const pojo = {x: new Set([123456789123456, 223456789123456, 323456789123456, 423456789123456])};
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ x
   └─ Set { 123,456,789,123,456, 223,456,789,123,456, 323,456,789,123,456, 423,456,789,12 ↵
      3,456 }"
`);
});

test('supports basic Uint8Array printing', () => {
  const pojo = {
    xxxxxxxxxxxxxxxxxxxxxxxxxxx: new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]),
  };
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ xxxxxxxxxxxxxxxxxxxxxxxxxxx = Uint8Array { 01 02 03 04 05 06 0 ↵
                                 7 08 09 0A 0B 0C 0D 0E 0F 10 11  ↵
                                 12 13 14 }"
`);
});

test('single Uint8Array', () => {
  const pojo = new Uint8Array([1, 2, 3]);
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`"Uint8Array { 01 02 03 }"`);
});

test('single long Uint8Array', () => {
  const pojo = new Uint8Array([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  ]);
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"Uint8Array { 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 14 15 16 17 18 19 1 ↵
A 1B 1C 1D 1E }"
`);
});

test('empty Uint8Array', () => {
  const pojo = new Uint8Array(0);
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`"Uint8Array {}"`);
});

test('empty Uint16Array', () => {
  const pojo = new Uint16Array(0);
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`"Uint16Array {}"`);
});

test('small Uint16Array', () => {
  const pojo = new Uint16Array([1, 2, 3]);
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`"Uint16Array { 0001 0002 0003 }"`);
});

test('small ArrayBuffer', () => {
  const pojo = {a: new ArrayBuffer(8)};
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ a = ArrayBuffer { 00 00 00 00 00 00 00 00 }"
`);
});

test('small DataView', () => {
  const pojo = {a: new DataView(new ArrayBuffer(8))};
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ a = DataView { 00 00 00 00 00 00 00 00 }"
`);
});

class CustomClass {
  field1 = 'value1';
}

test('can print custom class', () => {
  const pojo = {custom: new CustomClass()};
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ custom
   └─ CustomClass {}
      └─ field1 = "value1""
`);
});

test('can print custom class at root', () => {
  const pojo = new CustomClass();
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
└─ CustomClass {}
   └─ field1 = "value1""
`);
});

test('can print functions', () => {
  const pojo = {
    func: () => {},
    'crazy name': () => {},
    namedFunc: function named() {},
    asyncFunc: async (arg: any) => 123,
    toTree,
  };
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`
"╿
├─ func = fn "func" ( 0 args )
├─ "crazy name" = fn "crazy name" ( 0 args )
├─ namedFunc = fn "named" ( 0 args )
├─ asyncFunc = fn "asyncFunc" ( 1 args )
└─ toTree = fn "toTree" ( 1 args )"
`);
});

test('can a single functions', () => {
  const pojo = () => {};
  const formatted = toTree(pojo);
  expect(formatted).toMatchInlineSnapshot(`"fn "pojo" ( 0 args )"`);
});
