'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyStorage = undefined;
exports.default = of;

var _ramda = require('ramda');

var _apropos = require('apropos');

var { Just, Nothing } = _apropos.Maybe;

// import { Just, Nothing, Maybe } from 'folktale/maybe'
class KeyStorage {
  get length() {
    return this.ids.length;
  }
  constructor(keyMap, ids) {
    Object.defineProperties(this, {
      keyMap: {
        value: keyMap
      },
      ids: {
        value: ids
      }
    });
  }
  has(dc) {
    if (!isFinite(dc)) return false;
    return this.ids.indexOf(parseInt(dc, 10)) > -1;
  }
  get(dc) {
    if (!this.has(dc)) return false;
    return this.keyMap[String(dc)];
  }
  getMaybe(dc) {
    if (!this.has(dc)) return Nothing();
    var result = this.keyMap[String(dc)];
    if (Array.isArray(result) && result.length > 0) {
      return Just(result);
    }
    return Nothing();
  }
  set(dc, value) {
    if (!isFinite(dc)) return this;
    var dcN = parseInt(dc, 10);
    return new KeyStorage(Object.assign({}, this.keyMap, {
      [String(dc)]: value
    }), [...new Set([...this.ids, dcN])]);
  }
  remove(dc) {
    if (!this.has(dc)) return this;
    var dcN = parseInt(dc, 10);
    return new KeyStorage((0, _ramda.dissoc)(String(dc), this.keyMap), (0, _ramda.without)([dcN], this.ids));
  }
  merge(obj) {
    var rawResult = Object.assign({}, this.keyMap, obj);
    var result = (0, _ramda.filter)(e => Array.isArray(e), rawResult);
    return new KeyStorage(result, numberKeys(result));
  }
  toValue() {
    return this.keyMap;
  }
  toJSON() {
    return this.toValue();
  }

  static of(keyMap) {
    var fullKeyMap = keyMap;
    if (!fullKeyMap) {
      fullKeyMap = {};
    }
    var ids = numberKeys(fullKeyMap);
    return new KeyStorage(fullKeyMap, ids);
  }
}

exports.KeyStorage = KeyStorage;
function of(keyMap) {
  var fullKeyMap = keyMap;
  if (!fullKeyMap) {
    fullKeyMap = {};
  }
  var ids = numberKeys(fullKeyMap);
  return new KeyStorage(fullKeyMap, ids);
}

var numberKeys = obj => Object.keys(obj).filter(isFinite).map(e => parseInt(e, 10));
//# sourceMappingURL=key-storage.js.map