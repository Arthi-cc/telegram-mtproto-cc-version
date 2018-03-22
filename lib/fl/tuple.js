"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


/* eslint-disable no-underscore-dangle */

class Tuple {
  constructor(fst, snd) {
    this._1 = fst;
    this._2 = snd;
  }

  dimap(f, g) {
    return new Tuple(f(this._1), g(this._2));
  }
  map(f) {
    return new Tuple(this._1, f(this._2));
  }
  curry(f) {
    return f(this);
  }
  uncurry(f) {
    return f(this._1, this._2);
  }
  extend(f) {
    return new Tuple(this._1, f(this));
  }
  extract() {
    return this._2;
  }
  foldl(f, z) {
    return f(this._2, z);
  }
  foldr(f, z) {
    return f(z, this._2);
  }
  foldMap(f /*:: : *, p: * */) {
    return f(this._2);
  }
}

exports.default = Tuple;
class Tuple2 extends Tuple {
  constructor(fst, snd) {
    super(fst, snd);
  }
  concat(b) {
    return new Tuple2(this._1.concat(b._1), this._2.concat(b._2));
  }
}
exports.Tuple2 = Tuple2;
//# sourceMappingURL=tuple.js.map