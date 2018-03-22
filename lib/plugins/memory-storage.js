'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemoryStorage = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _ramda = require('ramda');

require('mtproto-shared');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Basic storage implementation.
 * Saves data in memory
 *
 * @export
 * @class MemoryStorage
 * @implements {AsyncStorage}
 */
class MemoryStorage {

  constructor(data) {
    if (data != null) this.store = new Map((0, _ramda.toPairs)(data));else this.store = new Map();
  }

  get(key) {
    return _bluebird2.default.resolve(this.store.get(key));
  }

  set(key, val) {
    this.store.set(key, val);
    return _bluebird2.default.resolve();
  }

  has(key) {
    return _bluebird2.default.resolve(this.store.has(key));
  }

  remove(...keys) {
    keys.map(e => this.store.delete(e));
    return _bluebird2.default.resolve();
  }

  /**
   * @deprecated
   */
  clear() {
    this.store.clear();
    return _bluebird2.default.resolve();
  }
}

exports.MemoryStorage = MemoryStorage;
exports.default = MemoryStorage;
//# sourceMappingURL=memory-storage.js.map