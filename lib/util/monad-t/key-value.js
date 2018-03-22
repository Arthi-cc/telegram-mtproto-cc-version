'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyValue = undefined;

var _ramda = require('ramda');

var _apropos = require('apropos');

var _tuple = require('./tuple');

var { Just, Nothing } = _apropos.Maybe;
// import { Maybe, Just, Nothing } from 'folktale/maybe'
class KeyValue {
  constructor(pairs) {
    this.pairs /*::; const c */ = pairs;
    this.length /*::; const l */ = pairs.length;
  }
  get keys() {
    return this.pairs.map(pair => pair.fst());
  }
  get values() {
    return this.pairs.map(pair => pair.snd());
  }
  toValue() {
    return this.pairs.map(e => e.toValue());
  }
  inspect() {
    return this.toJSON();
  }
  toJSON() {
    if (this.length === 0) return 'empty';
    var pairs = this.pairs.map(e => e.toValue());
    if (String(this.keys[0]) === '[object Object]') return pairs;
    return (0, _ramda.into)({}, e => e, pairs);
  }
  hasKey(key) {
    return (0, _ramda.contains)(key, this.keys);
  }
  hasValue(value) {
    return (0, _ramda.contains)(value, this.values);
  }
  maybeGetK(key) {
    if (!this.hasKey(key)) return Nothing();
    return Just(unsafeGetK(this.pairs, this.keys, key));
  }
  maybeGetV(value) {
    if (!this.hasValue(value)) return Nothing();
    return Just(unsafeGetV(this.pairs, this.values, value));
  }
  push(list) {
    var pairs = _tuple.TupleT.fromArray(list);
    var result = pairs.reduce((acc, val) => this.pairs.some(x => x.eqFirst(val)) ? acc : (0, _ramda.append)(val, acc), []);
    return new KeyValue(this.pairs.concat(result));
  }
  removeK(key) {
    if (this.hasKey(key)) return new KeyValue((0, _ramda.without)([unsafeGetK(this.pairs, this.keys, key)], this.pairs));
    return this;
  }
  removeV(value) {
    if (this.hasValue(value)) return new KeyValue((0, _ramda.without)([unsafeGetV(this.pairs, this.values, value)], this.pairs));
    return this;
  }
  extend(fn) {
    var pairs = this.pairs.map(tuple => tuple.extend(fn));
    return new KeyValue(pairs);
  }
  static empty() {
    return new KeyValue([]);
  }
  static of(pairs) {
    return new KeyValue(pairs);
  }
}

exports.KeyValue = KeyValue;
function unsafeGetK(pairs, keys, key) {
  return pairs[keys.indexOf(key)];
}
function unsafeGetV(pairs, values, value) {
  return pairs[values.indexOf(value)];
}
//# sourceMappingURL=key-value.js.map