

// import { Maybe } from 'folktale/maybe'
import { Maybe } from 'apropos';

import { ᐸMapᐳ, ᐸEmptyᐳ, λMap } from './index.h';
import OnlyStatic from '../only-static';

export class Tuple {
  constructor(a, b) {
    this.ᐸ1ᐳ /*::; const aa */ = a;
    this.ᐸ2ᐳ /*::; const bb */ = b;
  }
  fst() {
    return this.ᐸ1ᐳ;
  }
  snd() {
    return this.ᐸ2ᐳ;
  }
  bimap(f, g) {
    return new Tuple(f(this.ᐸ1ᐳ), g(this.ᐸ2ᐳ));
  }
  map(f) {
    return new Tuple(this.ᐸ1ᐳ, f(this.ᐸ2ᐳ));
  }
  curry(f) {
    return f(this);
  }
  uncurry(f) {
    return f(this.ᐸ1ᐳ, this.ᐸ2ᐳ);
  }
  extend(f) {
    return new Tuple(this.ᐸ1ᐳ, f(this));
  }
  extract() {
    return this.ᐸ2ᐳ;
  }
  foldl(f, z) {
    return f(this.ᐸ2ᐳ, z);
  }
  foldr(f, z) {
    return f(z, this.ᐸ2ᐳ);
  }
  foldMap(f) {
    return f(this.ᐸ2ᐳ);
  }
  equals(tuple) {
    return this.eqFirst(tuple) && this.eqSecond(tuple);
  }
  eqFirst(tuple) {
    return eq(this.fst(), tuple.fst());
  }
  eqSecond(tuple) {
    return eq(this.snd(), tuple.snd());
  }
  toValue() {
    return [this.ᐸ1ᐳ, this.ᐸ2ᐳ];
  }
  toJSON() {
    return this.toValue();
  }
  toString() {
    return `Tuple( ${String(this.ᐸ1ᐳ)}, ${String(this.ᐸ2ᐳ)} )`;
  }
  static of(a, b) {
    return new Tuple(a, b);
  }
}

export class TupleT extends OnlyStatic {
  static fromArray(list) {
    return list.map(([key, val]) => ofTuple(key, val));
  }
}

TupleT.of = ofTuple;
TupleT.traverseMaybe = traverseMaybe;
TupleT.snd = snd;
TupleT.fst = fst;
function traverseMaybe(tuple) {
  var a = tuple.fst();
  var b = tuple.snd();
  return b.map(bVal => new Tuple(a, bVal));
}

function snd(tuple) {
  return tuple.snd();
}

function fst(tuple) {
  return tuple.fst();
}

function eq(a, b) {
  if (a === b) return true;
  if (canCompare(a) && canCompare(b))
    //$off
    return a.equals(b) && b.equals(a);
  return false;
}

function ofTuple(a, b) {
  return new Tuple(a, b);
}

var typeID = 'zero-bias/Tuple@1';

export var MTuple = {
  '@@type': typeID,
  of: ([a, b]) => new Tuple(a, b),
  'fantasy-land/of': ([a, b]) => new Tuple(a, b),
  empty: () => new Tuple(void 0, void 0),
  'fantasy-land/empty': () => new Tuple(void 0, void 0)

  /*::  ; const dull = {} */

};Object.assign( /*:: dull, */Tuple, MTuple);

function canCompare(x) {
  return typeof x === 'object' && x != null && typeof x.equals === 'function';
}

export default Tuple;
//# sourceMappingURL=tuple.js.map