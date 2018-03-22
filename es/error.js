import 'axios';

import stackCleaner from './util/clean-stack';

import './mtp.h';

Error.stackTraceLimit = 25;

export class MTError extends Error {
  static getMessage(code, type, message) {
    return `MT[${code}] ${type}: ${message}`;
  }

  constructor(code, type, message) {
    var fullMessage = MTError.getMessage(code, type, message);
    super(fullMessage);
    this.code = code;
    this.type = type;
    this.stack = stackCleaner(this.stack);
  }
}

export class TypedError extends MTError {
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

export class ErrorBadResponse extends MTError {
  constructor(url, originalError = null) {
    super(406, 'NETWORK_BAD_RESPONSE', url);
    if (originalError) this.originalError = originalError;
  }
}

export class ErrorBadRequest extends MTError {
  constructor(url, originalError = null) {
    super(406, 'NETWORK_BAD_REQUEST', url);
    if (originalError) this.originalError = originalError;
  }
}

export class ErrorNotFound extends MTError {
  constructor(err) {
    super(404, 'REQUEST_FAILED', err.config.url);
    // this.originalError = err
  }
}

export class DcUrlError extends MTError {
  constructor(dcID, dc) {
    super(860, 'WRONG_DC_URL', `Wrong url! dcID ${dcID}, url ${dc.toString()}`);
    // this.originalError = err
  }
}

/**
 *
 * @deprecated Error format is changed!
 * @class RpcError
 * @extends {MTError}
 */
export class RpcError extends MTError {
  constructor(code, type, message, originalError) {
    super(code, type, message);
    this.originalError = originalError;
  }
}

/**
 * Api error object
 *
 * @class RpcApiError
 * @extends {MTError}
 */
export class RpcApiError extends MTError {
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

export class ProtocolError extends MTError {
  constructor(code, shortMessage, fullDescription) {
    super(code, 'ProtocolError', shortMessage);
    this.description = fullDescription;
  }
}

export class TypeBufferIntError extends MTError {
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

export class AuthKeyError extends MTError {
  constructor() {
    super(401, 'AUTH_KEY_EMPTY', '');
  }
}

export class ProviderRegistryError extends MTError {
  constructor(uid) {
    super(850, 'NO_INSTANCE', `Lib instance ${uid} not found in registry`);
  }
}
//# sourceMappingURL=error.js.map