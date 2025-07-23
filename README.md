# `pojo-dump`

Prints a JSON structure (or any POJO) to the console. Can print to a single line
or to a tree structure.


## Installation

Install the package using NPM or Yarn:

```bash
npm install pojo-dump
# or
yarn add pojo-dump
```


## Exports

The library provides the following exports:

- `toLine`: Formats data into a compact, single-line JSON-like representation.
- `toTree`: Formats data into a tree-like structure for better readability.
- `logTree`: Logs the tree-like structure to the console.


## Usage

Print to a single line:

```js
import { toLine } from 'pojo-dump';

const data = [null, true, false, 123, 0.1, 'as\ndf', [1, 2, 3], { foo: 'bar' }];
console.log(toLine(data));
// [ !n, !t, !f, 123, .1, "as" ⏎ "df", [ 1, 2, 3 ], { foo = "bar" } ]
```

Print to a multi-line tree layout:

```js
import { toTree } from 'pojo-dump';

const data = { foo: 'bar', nested: [1, 2, { key: 'value' }] };
console.log(toTree(data));

/*
Output:
╿
├─ foo = "bar"
└─ nested
   ├─ [0]: 1
   ├─ [1]: 2
   └─ [2]
      └─ key = "value"
*/
```


## Formatting choices

- Constant literals:
  ```ts
  console.log(toLine([true, false, null, undefined]));
  // Output: [ !t, !f, !n, !u ]
  ```

- Number literals:
  ```ts
  console.log(toLine([1000, 0.1]));
  // Output: [ 1,000, .1 ]
  ```

- Formatting strings with special characters:
  ```ts
  console.log(toLine('hello\nworld'));
  // Output: "hello" ⏎ "world"
  ```

- Formatting binary data:
  ```ts
  console.log(toLine(new Uint8Array([104, 101, 108, 108, 111])));
  // Output: Uint8Array { 68 65 6C 6C 6F }
  ```


## License

Apache 2.0