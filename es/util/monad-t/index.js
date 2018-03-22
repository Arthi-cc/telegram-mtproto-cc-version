import { Right, Left, of, ofL } from 'apropos';
import { append } from 'ramda';
import { Fluture, of as resolve, reject, Future } from 'fluture';
// import { Maybe, Just } from 'folktale/maybe'

import { Maybe } from 'apropos';
var { Just } = Maybe;

import * as Identity from './identity';

export { Identity };

import OnlyStatic from '../only-static';
import { TupleT, Tuple, MTuple } from './tuple';

export { TupleT, Tuple, MTuple };
export { KeyValue } from './key-value';

export function maybeAp(fn, val) {
  return val.chain(data => fn.map(f => f(data)));
}

export var traverseMaybe = (() => {

  function traverseReducer(acc, val) {
    return maybeAp(val.map(append), acc);
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
  var res = /*:: foldMerge(*/future.fold(Left, Right);
  /*:: )*/
  return res;
}

export class FutureEither {
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

export function futureEither(future) {
  return new FutureEither(futureEitherWrap(future));
}

export function eitherToFuture(either) {
  return Future((rj, rs) => {
    either.bitap(rj, rs);
  });
}

export class FutureT extends OnlyStatic {
  static futureEither(future) {
    var wrapped = futureEitherWrap(future);
    return new FutureEither(wrapped);
  }
}

FutureT.wrapEither = futureEitherWrap;
export class EitherT extends OnlyStatic {
  static futureEither(either) {
    var asFuture = EitherT.toFuture(either);
    return FutureT.futureEither(asFuture);
  }
  //$off
  static both(e1, e2) {
    if (e1.isLeft()) return e1;
    return e2.isRight()
    //$off
    ? Right([e1.value, e2.value]) : e2;
  }

  static unwrapMaybe(toLeft, either) {
    return either.logic({
      cond: MaybeT.isJust,
      pass: MaybeT.unsafeGet,
      fail: toLeft
    });
  }
}

EitherT.toFuture = eitherToFuture;
export class MaybeT extends OnlyStatic {

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
    return m.fold(() => Left(toLeft()), Right);
  }

  static toEitherR(m) {
    return MaybeT.toEither(() => void 0, m);
  }

  static toFuture(toLeft, m) {
    return m.fold(() => reject(toLeft()), resolve);
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

MaybeT.traverse = traverseMaybe;
MaybeT.traverse3 = traverseMaybe3;
export { These } from './these';


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