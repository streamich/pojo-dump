import {dim} from './util';

const dataViewContents = (view: Uint8Array): string =>
  ' ' +
  ((view as any).length
    ? `{ ${view
        .toString()
        .split(',')
        .map((byte) =>
          Number(byte)
            .toString(16)
            .toUpperCase()
            .padStart(view.BYTES_PER_ELEMENT << 1, '0'),
        )
        .join(' ')} }`
    : '{}');

export const toLine = (value: unknown, spacing: string = ' '): string => {
  switch (value) {
    case null:
      return '!n';
    case undefined:
      return '!u';
    case true:
      return '!t';
    case false:
      return '!f';
  }
  switch (typeof value) {
    case 'number':
    case 'bigint': {
      const formatted =
        typeof value === 'number' && Math.round(value) !== value
          ? value + ''
          : Intl.NumberFormat('en-US').format(value) + (typeof value === 'bigint' ? 'n' : '');
      if (formatted[0] === '0' && formatted[1] === '.') return formatted.slice(1);
      return formatted;
    }
    case 'string': {
      if (!value) return '""';
      const parts = value.split(/([\u0000-\u001F]|\n|\t)/);
      return parts
        .filter(Boolean)
        .map((part) => {
          if (part === '\n') return '⏎';
          if (part === '\t') return '⇥';
          if (part.length === 1 && part.charCodeAt(0) < 32)
            return '\\x' + part.charCodeAt(0).toString(16).padStart(2, '0');
          return dim('"') + JSON.stringify(part).slice(1, -1) + dim('"');
        })
        .join(' ');
    }
    case 'object': {
      if (Array.isArray(value))
        return value.length
          ? `[${spacing}${value.map((v) => toLine(v, spacing)).join(',' + spacing)}${spacing}]`
          : '[]';
      if (value instanceof DataView)
        return (
          value.constructor.name + dataViewContents(new Uint8Array(value.buffer, value.byteOffset, value.byteLength))
        );
      if (ArrayBuffer.isView(value)) return value.constructor.name + dataViewContents(value as any);
      if (value instanceof ArrayBuffer) return 'ArrayBuffer' + dataViewContents(new Uint8Array(value));
      if (value instanceof Date) return 'Date { ' + value.getTime() + ' }';
      if (value instanceof RegExp) return value + '';
      const keys = Object.keys(value as object);
      if (!keys.length) return '{}';
      return `{${spacing}${keys
        .map((k) => `${k}${spacing}${dim('=')}${spacing}${toLine((value as any)[k], spacing)}`)
        .join(',' + spacing)}${spacing}}`;
    }
    case 'function': {
      return `fn ${toLine(value.name)} ( ${value.length} args )`;
    }
    case 'symbol': {
      return `sym ( ${value.description} )`;
    }
  }
  return '?';
};
