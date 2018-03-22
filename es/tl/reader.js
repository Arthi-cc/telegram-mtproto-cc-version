import { TypeBuffer } from './type-buffer';
import { lshift32, bytesToHex } from '../bin';

import Logger from 'mtproto-logger';
var log = Logger`tl:reader`;

export function readInt(ctx, field) {
  var result = ctx.nextInt();
  log('int')(field, result);
  return result;
}

export function readLong(ctx, field) {
  var iLow = readInt(ctx, `${field}:long[low]`);
  var iHigh = readInt(ctx, `${field}:long[high]`);

  var res = lshift32(iHigh, iLow);
  return res;
}

export function readDouble(ctx, field) {
  var buffer = new ArrayBuffer(8);
  var intView = new Int32Array(buffer);
  var doubleView = new Float64Array(buffer);

  intView[0] = readInt(ctx, `${field}:double[low]`);
  intView[1] = readInt(ctx, `${field}:double[high]`);

  return doubleView[0];
}

export function readString(ctx, field) {
  var bytes = readBytes(ctx, `${field}:string`);
  var sUTF8 = [...bytes].map(getChar).join('');

  var s = void 0;
  try {
    s = decodeURIComponent(escape(sUTF8));
  } catch (e) {
    s = sUTF8;
  }

  log(`string`)(s, `${field}:string`);

  return s;
}

export function readBytes(ctx, field) {
  var len = ctx.nextByte();

  if (len == 254) {
    len = ctx.nextByte() | ctx.nextByte() << 8 | ctx.nextByte() << 16;
  }

  var bytes = ctx.next(len);
  ctx.addPadding();

  log(`bytes`)(bytesToHex(bytes), `${field}:bytes`);

  return bytes;
}

var getChar = e => String.fromCharCode(e);
//# sourceMappingURL=reader.js.map