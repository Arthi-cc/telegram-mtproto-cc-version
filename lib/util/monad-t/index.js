'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.These = exports.MaybeT = exports.EitherT = exports.FutureT = exports.FutureEither = exports.traverseMaybe = exports.KeyValue = exports.MTuple = exports.Tuple = exports.TupleT = exports.Identity = undefined;

var _keyValue = require('./key-value');

Object.defineProperty(exports, 'KeyValue', {
  enumerable: true,
  get: function () {
    return _keyValue.KeyValue;
  }
});
exports.maybeAp = maybeAp;
exports.futureEither = futureEither;
exports.eitherToFuture = eitherToFuture;

var _these = require('./these');

Object.defineProperty(exports, 'These', {
  enumerable: true,
  get: function () {
    return _these.These;
  }
});

var _apropos = require('apropos');

var _ramda = require('ramda');

var _fluture = require('fluture');

var _identity = require('./identity');

var Identity = _interopRequireWildcard(_identity);

var _onlyStatic = require('../only-static');

var _onlyStatic2 = _interopRequireDefault(_onlyStatic);

var _tuple = require('./tuple');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var { Just } = _apropos.Maybe;
// import { Maybe, Just } from 'folktale/maybe'

exports.Identity = Identity;
exports.TupleT = _tuple.TupleT;
exports.Tuple = _tuple.Tuple;
exports.MTuple = _tuple.MTuple;
function maybeAp(fn, val) {
  return val.chain(data => fn.map(f => f(data)));
}

var traverseMaybe = exports.traverseMaybe = (() => {

  function traverseReducer(acc, val) {
    return maybeAp(val.map(_ramda.append), acc);
  }

  return function traverseMaybe(list) {
    return list.reduce(traverseReducer, Just([]));
  };
})();

function traverseMaybe3(a, b, c) {
  //$off
  var result = traverseMaybe([a, b, c]);

  return result;
}

function futureEitherWrap(future) {
  var res = /*:: foldMerge(*/future.fold(_apropos.Left, _apropos.Right);
  /*:: )*/
  return res;
}

class FutureEither {
  constructor(value) {
    this.value = value;
  }
  promise() {
    return this.value.promise();
  }
  map(fn) {
    return new FutureEither(this.value.map(either => either.map(fn)));
  }
  mapL(fn) {
    return new FutureEither(this.value.map(either => either.mapL(fn)));
  }
  chain(fn) {
    return new FutureEither(this.value.map(either => either.chain(fn)));
  }
  chainL(fn) {
    return new FutureEither(this.value.map(either => either.chainL(fn)));
  }
  chainAsync(fn) {
    return futureEither(this.toPlainFuture().chain(fn));
  }
  chainAsyncL(fn) {
    return futureEither(this.toPlainFuture().chainRej(fn));
  }
  toPlainFuture() {
    return this.value.chain(x => eitherToFuture(x));
  }
}

exports.FutureEither = FutureEither;
function futureEither(future) {
  return new FutureEither(futureEitherWrap(future));
}

function eitherToFuture(either) {
  return (0, _fluture.Future)((rj, rs) => {
    either.bitap(rj, rs);
  });
}

class FutureT extends _onlyStatic2.default {
  static futureEither(future) {
    var wrapped = futureEitherWrap(future);
    return new FutureEither(wrapped);
  }
}

exports.FutureT = FutureT;
FutureT.wrapEither = futureEitherWrap;
class EitherT extends _onlyStatic2.default {
  static futureEither(either) {
    var asFuture = EitherT.toFuture(either);
    return FutureT.futureEither(asFuture);
  }
  //$off
  static both(e1, e2) {
    if (e1.isLeft()) return e1;
    return e2.isRight()
    //$off
    ? (0, _apropos.Right)([e1.value, e2.value]) : e2;
  }

  static unwrapMaybe(toLeft, either) {
    return either.logic({
      cond: MaybeT.isJust,
      pass: MaybeT.unsafeGet,
      fail: toLeft
    });
  }
}

exports.EitherT = EitherT;
EitherT.toFuture = eitherToFuture;
class MaybeT extends _onlyStatic2.default {

  static both(m1, m2) {
    return traverseMaybe([m1, m2]);
    /*::
      .map(() => [unsafeGetMaybe(m1), unsafeGetMaybe(m2)])
    */
  }


  static unsafeGet(x) {
    return x.fold(ERR.isNothing, x => x);
  }

  static ap(fn, val) {
    return val.chain(data => fn.map(f => f(data)));
  }

  static toEither(toLeft, m) {
    return m.fold(() => (0, _apropos.Left)(toLeft()), _apropos.Right);
  }

  static toEitherR(m) {
    return MaybeT.toEither(() => void 0, m);
  }

  static toFuture(toLeft, m) {
    return m.fold(() => (0, _fluture.reject)(toLeft()), _fluture.of);
  }

  static fold(toLeft, m) {
    return m.fold(toLeft, x => x);
  }

  static toFutureR(m) {
    return MaybeT.toFuture(() => void 0, m);
  }

  static isJust(x) {
    return x.isJust();
  }

}

exports.MaybeT = MaybeT;
MaybeT.traverse = traverseMaybe;
MaybeT.traverse3 = traverseMaybe3;


/*::
type UnsafeGetMaybe = <T>(x: Maybe<T>) => T
declare var unsafeGetMaybe: UnsafeGetMaybe
*/

var ERR = {
  isNothing() {
    throw new Error(`UnsafeMaybeValue recieve nothing`);
  }
};
//# sourceMappingURL=index.js.map