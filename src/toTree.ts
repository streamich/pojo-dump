import {printTree} from 'tree-dump/lib/printTree';
import {toLine} from './toLine';
import {dim} from './util';

const LINE_WIDTH = 90;

const isPrimitive = (value: unknown): boolean => typeof value !== 'object' || value === null;
const isShortPrimitive = (value: unknown): boolean => {
  if (typeof value === 'string') return value.length < 32;
  return isPrimitive(value);
};
const isShortValue = (value: unknown): boolean => {
  if (isShortPrimitive(value)) return true;
  if (Array.isArray(value)) return value.length === 0;
  else if (value && typeof value === 'object' && Object.keys(value).length === 0) {
    if (value instanceof Date || value instanceof RegExp) return true;
    return !value.constructor || (value as any).constructor === Object;
  }
  return false;
};
const isOneLineValue = (value: unknown): boolean => {
  if (isPrimitive(value)) return true;
  if (Array.isArray(value)) {
    const length = value.length;
    if (length === 0) return true;
    if (length < 5) {
      for (const item of value) if (!isShortValue(item)) return false;
      return true;
    }
  } else if (value && typeof value === 'object') {
    if (!value.constructor || value.constructor !== Object) return false;
    const keys = Object.keys(value);
    const length = keys.length;
    if (length === 0) return true;
    if (length < 3) {
      for (const key of keys) {
        if (!isShortPrimitive(key)) return false;
        if (!isShortPrimitive((value as Record<string, unknown>)[key])) return false;
      }
      return true;
    }
  }
  return false;
};
const isSimpleString = (str: string) => /^[a-z0-9]+$/i.test(str);

const wrap = (line: string, tab: string, targetLineWidth: number): string => {
  const targetLineSize = Math.max(32, targetLineWidth - tab.length);
  if (line.length <= targetLineSize) return line;
  let lines = '';
  let pos = 0;
  while (pos < line.length) {
    const nextPos = pos + targetLineSize;
    lines += (lines ? ' ↵\n' + tab : '') + line.slice(pos, nextPos);
    pos = nextPos;
  }
  return lines;
};

const wrappedStringify = (value: unknown, tab: string): string => {
  if (typeof value === 'string') {
    // let text = toLine(value);
    // const lines = text.split('" ⏎ ');
    const lines = value.split('\n');
    const length = lines.length;
    const lines2: string[] = [];
    for (let i = 0; i < length; i++) {
      const rawLine = lines[i];
      const isFirst = i === 0;
      if (!rawLine && !isFirst) {
        lines[i] = tab;
        continue;
      }
      const line = toLine(rawLine);
      const isLast = i + 1 === length;
      lines[i] = (isFirst ? '' : tab) + wrap(line, tab, LINE_WIDTH);
    }
    // text = lines.join('\n');
    // const text = text.replaceAll('⏎ ↵', '⏎');
    const text = lines.join(' ⏎\n');
    // text = text.replaceAll('" ⏎ ', '" ⏎\n');
    // text = wrap(text, tab, LINE_WIDTH);
    return text;
  }
  return wrap(toLine(value), tab, LINE_WIDTH)
};

const printEntry = (key: unknown, val: unknown, tab: string): string => {
  const stringifyKey = typeof key === 'string' ? !isSimpleString(key) : true;
  const formattedKey = stringifyKey ? toLine(key) : key + '';
  const formattedKeyLength = formattedKey.length;
  const wrappedKey = formattedKeyLength > 32 ? wrap(formattedKey, tab, 42) : formattedKey;
  const oneLine = isOneLineValue(val);
  const lastKeyLineWidth = formattedKeyLength > 32 ? (formattedKeyLength % 42) + 3 : formattedKeyLength;
  let valueFormatted = oneLine
    ? ' ' + dim('=') + ' ' + wrappedStringify(val, tab + ' '.repeat(lastKeyLineWidth) + '   ')
    : toTree(val, tab, '');
  if (!oneLine && valueFormatted[0] !== '\n')
    valueFormatted =
      ' ' +
      dim('=') +
      ' ' +
      wrap(
        valueFormatted,
        tab + ' '.repeat(3 + Math.min(42, formattedKeyLength)),
        Math.max(32, LINE_WIDTH - tab.length - formattedKeyLength - 3),
      );
  return wrappedKey + valueFormatted;
};

export const toTree = (value: unknown, tab: string = '', prefix = '╿\n' /* '┯\n' */): string => {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return (
      prefix +
      printTree(
        tab,
        value.map((v, i) => (tab: string) => {
          const oneLine = isOneLineValue(v);
          const index = i + '';
          return `[${index}]${oneLine ? dim(':') + ' ' + wrappedStringify(v, tab + ' '.repeat(index.length) + '    ') : toTree(v, tab + ' ', '')}`;
        }),
      ).slice(tab ? 0 : 1)
    );
  } else if (value && typeof value === 'object') {
    if (
      value instanceof Date ||
      value instanceof RegExp ||
      ArrayBuffer.isView(value) ||
      value instanceof ArrayBuffer ||
      value instanceof DataView
    )
      return wrap(toLine(value), tab, LINE_WIDTH);
    if (value instanceof Map) {
      return (
        prefix +
        printTree(tab, [
          (tab: string) =>
            'Map {}' +
            printTree(
              tab,
              Array.from(value.entries()).map(
                ([k, v]) =>
                  (tab: string) =>
                    printEntry(k, v, tab),
              ),
            ),
        ]).slice(tab ? 0 : 1)
      );
    }
    if (value instanceof Set) {
      return (
        prefix +
        printTree(tab, [
          (tab: string) => {
            const arr = Array.from(value);
            if (!arr.length) return 'Set {}';
            if (isOneLineValue(arr)) {
              const line = 'Set {' + toLine(arr).slice(1, -1) + '}';
              return wrap(line, tab, LINE_WIDTH);
            }
            return 'Set {}' + toTree(arr, tab, '');
          },
        ]).slice(tab ? 0 : 1)
      );
    }
    if (value.constructor && value.constructor !== Object) {
      const obj = {} as Record<string, unknown>;
      for (const key of Object.keys(value)) obj[key] = (value as any)[key];
      const name = value.constructor.name + ' {}';
      return prefix + printTree(tab, [(tab: string) => name + toTree(obj, tab, '')]).slice(tab ? 0 : 1);
    }
    const keys = Object.keys(value as object);
    if (keys.length === 0) return toLine(value);
    return (
      prefix +
      printTree(
        tab,
        keys.map((k) => (tab: string) => printEntry(k, (value as any)[k], tab)),
      ).slice(tab ? 0 : 1)
    );
  }
  return wrappedStringify(value, tab);
};

export const logTree = (value: unknown, tab?: string, prefix?: string): void => console.log(toTree(value, tab, prefix));
