import { dissoc, without, filter } from 'ramda';

// import { Just, Nothing, Maybe } from 'folktale/maybe'
import { Maybe } from 'apropos';
var { Just, Nothing } = Maybe;

export class KeyStorage {
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
    return new KeyStorage(dissoc(String(dc), this.keyMap), without([dcN], this.ids));
  }
  merge(obj) {
    var rawResult = Object.assign({}, this.keyMap, obj);
    var result = filter(e => Array.isArray(e), rawResult);
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

export default function of(keyMap) {
  var fullKeyMap = keyMap;
  if (!fullKeyMap) {
    fullKeyMap = {};
  }
  var ids = numberKeys(fullKeyMap);
  return new KeyStorage(fullKeyMap, ids);
}

var numberKeys = obj => Object.keys(obj).filter(isFinite).map(e => parseInt(e, 10));
//# sourceMappingURL=key-storage.js.map