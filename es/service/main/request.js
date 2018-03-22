

// import { Maybe, fromNullable } from 'folktale/maybe'
import { Maybe } from 'apropos';
var { fromNullable } = Maybe;

import blueDefer from '../../util/defer';
import '../../newtype.h';
import uuid from '../../util/uuid';

export default class ApiRequest {
  constructor(data, options, uid, dc) {
    this.requestID = uuid();

    this.dc = fromNullable(dc);
    options.requestID = this.requestID;
    this.uid = uid;
    this.data = data;
    this.options = options;
    this.needAuth = !allowNoAuth(data.method);
    Object.defineProperty(this, 'defer', {
      value: blueDefer(),
      enumerable: false,
      writable: true
    });
    Object.defineProperty(this, 'deferFinal', {
      value: blueDefer(),
      enumerable: false,
      writable: true
    });
  }
  //$off
}

var noAuthMethods = ['auth.sendCode', 'auth.sendCall', 'auth.checkPhone', 'auth.signUp', 'auth.signIn', 'auth.importAuthorization', 'help.getConfig', 'help.getNearestDc'];

var allowNoAuth = method => noAuthMethods.indexOf(method) > -1;
//# sourceMappingURL=request.js.map