

/* eslint-disable no-whitespace-before-property */

import { toString, equals } from 'ramda';

import { ᐸMapᐳ, ᐸChainᐳ, ᐸEmptyᐳ, ᐸChainRecᐳ, ᐸOfᐳ, λMap, λChain } from './index.h';

class ChainRecNext {
  constructor(value) {
    this.isNext = true;
    this.done = false;

    this.value = value;
    /*:: return this */
  }
  static of(value) {
    return new ChainRecNext(value);
  }
}

class ChainRecDone {
  constructor(value) {
    this.isNext = false;
    this.done = true;

    this.value = value;
    /*:: return this */
  }
  static of(value) {
    return new ChainRecDone(value);
  }
}

/**
 * A data type that holds a value and exposes a monadic api.
 */
export class Identity {
  /**
   * Constructs a new `Identity[a]` data type that holds a single
   * value `a`.
   * @param {*} a Value of any type
   * @sig a -> Identity[a]
   */
  constructor(value) {
    if (value instanceof ChainRecNext || value instanceof ChainRecDone) this.value = value.value;else this.value = value;
  }

  /**
   * Functor specification. Creates a new `Identity[a]` mapping function `f` onto
   * `a` returning any value b.
   * @param {Function} f Maps `a` to any value `b`
   * @returns Identity[b]
   * @sig @Identity[a] => (a -> b) -> Identity[b]
   */
  map(f) {
    return new Identity(f(this.value));
  }

  /**
   * Chain specification. Transforms the value of the `Identity[a]`
   * type using an unary function to monads. The `Identity[a]` type
   * should contain a function, otherwise an error is thrown.
   *
   * @param {Function} fn Transforms `a` into a `Monad[b]`
   * @returns Monad[b]
   * @sig (Identity[a], m: Monad[_]) => (a -> m[b]) -> m[b]
   */
  chain(fn) {
    return fn(this.value);
  }

  /**
   * Returns the value of `Identity[a]`
   *
   * @returns a
   * @sig (Identity[a]) => a
   */
  get() {
    return this.value;
  }

  equals(value) {
    if (value instanceof Identity) return equals(this.value, value.value);
    return equals(this.value, value);
  }

  toString() {
    return `Identity(${toString(this.value)})`;
  }

  // static ap = ap

}

Identity.is = is;
Identity.of = of;
Identity.empty = empty;
Identity.chainRec = chainRec;
var typeID = 'zero-bias/Identity@1';

export var MIdentity = {
  '@@type': typeID,
  chainRec,
  'fantasy-land/chainRec': chainRec,
  of: value => new Identity(value),
  'fantasy-land/of': value => new Identity(value),
  empty: () => new Identity(void 0),
  'fantasy-land/empty': () => new Identity(void 0)
};

export function empty() {
  return new Identity(void 0);
}

export function is(value) {
  return value instanceof Identity;
}

/**
 * Applicative specification. Creates a new `Identity[a]` holding the value `a`.
 * @param {*} a Value of any type
 * @returns Identity[a]
 * @sig a -> Identity[a]
 */
export function of(value) {
  return new Identity(value);
}

export function chainRec(f, i) {
  var state = new ChainRecNext(i);
  while (state.isNext) {
    state = f(ChainRecNext.of, ChainRecDone.of, state.value);
  }

  return new Identity(state.value /*:: , n */);
}

/**
 * Apply specification. Applies the function inside the `Identity[a]`
 * type to another applicative type.
 * @param {Applicative[a]} app Applicative that will apply its function
 * @returns Applicative[b]
 * @sig (Identity[a -> b], f: Applicative[_]) => f[a] -> f[b]
 */

export function ap(mapper, value) {
  return value.map(mapper.value);
}

/*::  ; const dull = {} */

Object.assign( /*:: dull, */Identity, MIdentity);

// //eslint-disable-next-line
// Identity.prototype /*:: ; dull */ .ap =
//   function(value: any) {
//     return Identity.ap(this, value)
//   }
//# sourceMappingURL=identity.js.map