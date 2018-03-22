'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProviderRegistryError = exports.AuthKeyError = exports.TypeBufferIntError = exports.ProtocolError = exports.RpcApiError = exports.RpcError = exports.DcUrlError = exports.ErrorNotFound = exports.ErrorBadRequest = exports.ErrorBadResponse = exports.TypedError = exports.MTError = undefined;

require('axios');

var _cleanStack = require('./util/clean-stack');

var _cleanStack2 = _interopRequireDefault(_cleanStack);

require('./mtp.h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Error.stackTraceLimit = 25;

class MTError extends Error {
  static getMessage(code, type, message) {
    return `MT[${code}] ${type}: ${message}`;
  }

  constructor(code, type, message) {
    var fullMessage = MTError.getMessage(code, type, message);
    super(fullMessage);
    this.code = code;
    this.type = type;
    this.stack = (0, _cleanStack2.default)(this.stack);
  }
}

exports.MTError = MTError;
class TypedError extends MTError {
  constructor(message) {
    super(0, '', '');
    var code = 1e4 + this.constructor.groupOffset * 1e3 + this.constructor.blockOffset * 1e2 + this.constructor.typeOffset;
    this.code = code;
    this.block = this.constructor.block;
    this.group = this.constructor.group;
    this.type = this.constructor.type;
    this.message = `[${this.group} ${this.block} ${this.type}|${code.toString(10)}] ${message}`;
  }
}

exports.TypedError = TypedError;
class ErrorBadResponse extends MTError {
  constructor(url, originalError = null) {
    super(406, 'NETWORK_BAD_RESPONSE', url);
    if (originalError) this.originalError = originalError;
  }
}

exports.ErrorBadResponse = ErrorBadResponse;
class ErrorBadRequest extends MTError {
  constructor(url, originalError = null) {
    super(406, 'NETWORK_BAD_REQUEST', url);
    if (originalError) this.originalError = originalError;
  }
}

exports.ErrorBadRequest = ErrorBadRequest;
class ErrorNotFound extends MTError {
  constructor(err) {
    super(404, 'REQUEST_FAILED', err.config.url);
    // this.originalError = err
  }
}

exports.ErrorNotFound = ErrorNotFound;
class DcUrlError extends MTError {
  constructor(dcID, dc) {
    super(860, 'WRONG_DC_URL', `Wrong url! dcID ${dcID}, url ${dc.toString()}`);
    // this.originalError = err
  }
}

exports.DcUrlError = DcUrlError; /**
                                  *
                                  * @deprecated Error format is changed!
                                  * @class RpcError
                                  * @extends {MTError}
                                  */

class RpcError extends MTError {
  constructor(code, type, message, originalError) {
    super(code, type, message);
    this.originalError = originalError;
  }
}

exports.RpcError = RpcError; /**
                              * Api error object
                              *
                              * @class RpcApiError
                              * @extends {MTError}
                              */

class RpcApiError extends MTError {
  constructor(code = 999, message = 'no message') {
    super(code, 'RpcApiError', '');
    this.message = message;
  }
  static of(data) {
    return new RpcApiError(data.error_code, data.error_message);
  }
  toValue() {
    return {
      type: 'RpcApiError',
      code: this.code,
      message: this.message
    };
  }
  toJSON() {
    return this.toValue();
  }
}

exports.RpcApiError = RpcApiError;
class ProtocolError extends MTError {
  constructor(code, shortMessage, fullDescription) {
    super(code, 'ProtocolError', shortMessage);
    this.description = fullDescription;
  }
}

exports.ProtocolError = ProtocolError;
class TypeBufferIntError extends MTError {
  static getTypeBufferMessage(ctx) {
    var offset = ctx.offset;
    var length = ctx.intView.length * 4;
    return `Can not get next int: offset ${offset} length: ${length}`;
  }

  constructor(ctx) {
    var message = TypeBufferIntError.getTypeBufferMessage(ctx);
    super(800, 'NO_NEXT_INT', message);
    this.typeBuffer = ctx;
  }
}

exports.TypeBufferIntError = TypeBufferIntError;
class AuthKeyError extends MTError {
  constructor() {
    super(401, 'AUTH_KEY_EMPTY', '');
  }
}

exports.AuthKeyError = AuthKeyError;
class ProviderRegistryError extends MTError {
  constructor(uid) {
    super(850, 'NO_INSTANCE', `Lib instance ${uid} not found in registry`);
  }
}
exports.ProviderRegistryError = ProviderRegistryError;
//# sourceMappingURL=error.js.map