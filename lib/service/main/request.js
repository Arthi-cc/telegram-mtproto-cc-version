'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apropos = require('apropos');

var _defer = require('../../util/defer');

var _defer2 = _interopRequireDefault(_defer);

require('../../newtype.h');

var _uuid = require('../../util/uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var { fromNullable } = _apropos.Maybe;

// import { Maybe, fromNullable } from 'folktale/maybe'
class ApiRequest {
  constructor(data, options, uid, dc) {
    this.requestID = (0, _uuid2.default)();

    this.dc = fromNullable(dc);
    options.requestID = this.requestID;
    this.uid = uid;
    this.data = data;
    this.options = options;
    this.needAuth = !allowNoAuth(data.method);
    Object.defineProperty(this, 'defer', {
      value: (0, _defer2.default)(),
      enumerable: false,
      writable: true
    });
    Object.defineProperty(this, 'deferFinal', {
      value: (0, _defer2.default)(),
      enumerable: false,
      writable: true
    });
  }
  //$off
}

exports.default = ApiRequest;
var noAuthMethods = ['auth.sendCode', 'auth.sendCall', 'auth.checkPhone', 'auth.signUp', 'auth.signIn', 'auth.importAuthorization', 'help.getConfig', 'help.getNearestDc'];

var allowNoAuth = method => noAuthMethods.indexOf(method) > -1;
//# sourceMappingURL=request.js.map