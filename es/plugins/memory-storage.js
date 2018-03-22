import Bluebird from 'bluebird';

import { toPairs } from 'ramda';

import 'mtproto-shared';

/**
 * Basic storage implementation.
 * Saves data in memory
 *
 * @export
 * @class MemoryStorage
 * @implements {AsyncStorage}
 */
export class MemoryStorage {

  constructor(data) {
    if (data != null) this.store = new Map(toPairs(data));else this.store = new Map();
  }

  get(key) {
    return Bluebird.resolve(this.store.get(key));
  }

  set(key, val) {
    this.store.set(key, val);
    return Bluebird.resolve();
  }

  has(key) {
    return Bluebird.resolve(this.store.has(key));
  }

  remove(...keys) {
    keys.map(e => this.store.delete(e));
    return Bluebird.resolve();
  }

  /**
   * @deprecated
   */
  clear() {
    this.store.clear();
    return Bluebird.resolve();
  }
}

export default MemoryStorage;
//# sourceMappingURL=memory-storage.js.map