'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readInt = readInt;
exports.readLong = readLong;
exports.readDouble = readDouble;
exports.readString = readString;
exports.readBytes = readBytes;

var _typeBuffer = require('./type-buffer');

var _bin = require('../bin');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`tl:reader`;

function readInt(ctx, field) {
  var result = ctx.nextInt();
  log('int')(field, result);
  return result;
}

function readLong(ctx, field) {
  var iLow = readInt(ctx, `${field}:long[low]`);
  var iHigh = readInt(ctx, `${field}:long[high]`);

  var res = (0, _bin.lshift32)(iHigh, iLow);
  return res;
}

function readDouble(ctx, field) {
  var buffer = new ArrayBuffer(8);
  var intView = new Int32Array(buffer);
  var doubleView = new Float64Array(buffer);

  intView[0] = readInt(ctx, `${field}:double[low]`);
  intView[1] = readInt(ctx, `${field}:double[high]`);

  return doubleView[0];
}

function readString(ctx, field) {
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

function readBytes(ctx, field) {
  var len = ctx.nextByte();

  if (len == 254) {
    len = ctx.nextByte() | ctx.nextByte() << 8 | ctx.nextByte() << 16;
  }

  var bytes = ctx.next(len);
  ctx.addPadding();

  log(`bytes`)((0, _bin.bytesToHex)(bytes), `${field}:bytes`);

  return bytes;
}

var getChar = e => String.fromCharCode(e);
//# sourceMappingURL=reader.js.map