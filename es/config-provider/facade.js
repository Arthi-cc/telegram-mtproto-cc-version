

// import { Just, Nothing, fromNullable, Maybe } from 'folktale/maybe'

import { Maybe } from 'apropos';
var { fromNullable } = Maybe;

import '../service/main/index.h';
import '../newtype.h';
import getCrypto from '../co-worker';
import { getConfig } from './provider';
import random from '../service/secure-random';
import KeyManager from '../service/authorizer/rsa-keys-manger';
import NetworkerThread from '../service/networker';
import L1Cache from '../l1-cache';

var Config = {
  halt: {
    get(uid, dc) {
      var val = getConfig(uid).halt[dc];
      if (typeof val !== 'boolean') {
        Config.halt.set(uid, dc, false);
        return false;
      }
      return val;
    },
    set(uid, dc, val) {
      getConfig(uid).halt[dc] = val;
    }
  },
  // invoke(method: string, params: Object = {}, opts: Object = {}) {
  //
  // },
  seq: {
    get(uid, dc) {
      var seq = getConfig(uid).seq[dc];
      if (typeof seq !== 'number') {
        Config.seq.set(uid, dc, 1);
        return 1;
      }
      return seq;
    },
    set(uid, dc, newSeq) {
      getConfig(uid).seq[dc] = newSeq;
    }
  },
  apiConfig: {
    get(uid) {
      return getConfig(uid).apiConfig;
    }
  },
  thread: {
    set(uid, dc, thread) {
      getConfig(uid).thread[dc] = thread;
    },
    get(uid, dc) {
      return fromNullable(getConfig(uid).thread[dc]);
    }
  },
  storage: {
    get(uid, key) {
      return getConfig(uid).storage.get(key);
    },
    set(uid, key, value) {
      return getConfig(uid).storage.set(key, value);
    },
    has(uid, key) {
      return getConfig(uid).storage.has(key);
    },
    remove(uid, ...keys) {
      return getConfig(uid).storage.remove(...keys);
    }
  },
  storageAdapter: {
    get: {
      authKey(uid, dc) {
        return getConfig(uid).storageAdapter.getAuthKey(dc);
      },
      authID(uid, dc) {
        return getConfig(uid).storageAdapter.getAuthID(dc);
      },
      salt(uid, dc) {
        return getConfig(uid).storageAdapter.getSalt(dc);
      },
      dc(uid) {
        return getConfig(uid).storageAdapter.getDC();
      },
      nearestDC(uid) {
        return getConfig(uid).storageAdapter.getNearestDC();
      }
    },
    set: {
      authKey(uid, dc, data) {
        return getConfig(uid).storageAdapter.setAuthKey(dc, data);
      },
      authID(uid, dc, data) {
        return getConfig(uid).storageAdapter.setAuthID(dc, data);
      },
      salt(uid, dc, data) {
        return getConfig(uid).storageAdapter.setSalt(dc, data);
      },
      dc(uid, dc) {
        return getConfig(uid).storageAdapter.setDC(dc);
      },
      nearestDC(uid, dc) {
        return getConfig(uid).storageAdapter.setNearestDC(dc);
      }
    },
    remove: {
      authKey(uid, dc) {
        return getConfig(uid).storageAdapter.removeAuthKey(dc);
      },
      authID(uid, dc) {
        return getConfig(uid).storageAdapter.removeAuthID(dc);
      },
      salt(uid, dc) {
        return getConfig(uid).storageAdapter.removeSalt(dc);
      },
      dc(uid) {
        return getConfig(uid).storageAdapter.removeDC();
      },
      nearestDC(uid) {
        return getConfig(uid).storageAdapter.removeNearestDC();
      }
    }
  },
  fastCache: {
    get(uid, dc) {
      return getConfig(uid).fastCache[dc | 0];
    },
    init(uid, dc) {
      getConfig(uid).fastCache[dc | 0] = L1Cache.of();
    }
  },
  publicKeys: {
    get(uid, keyHex) {
      return getConfig(uid).publicKeys[keyHex] || false;
    },
    set(uid, keyHex, key) {
      getConfig(uid).publicKeys[keyHex] = key;
    },
    init(uid, keys) {
      getConfig(uid).keyManager = KeyManager(uid, keys, Config.publicKeys);
    },
    select(uid, fingerprints) {
      return getConfig(uid).keyManager(fingerprints);
    }
  },
  authRequest: {
    get(uid, dc) {
      return getConfig(uid).authRequest[dc];
    },
    set(uid, dc, req) {
      getConfig(uid).authRequest[dc] = req;
    },
    remove(uid, dc) {
      delete getConfig(uid).authRequest[dc];
    }
  },
  session: {
    get(uid, dc) {
      var session = getConfig(uid).session[dc];
      if (!Array.isArray(session)) {
        session = new Array(8);
        random(session);
        Config.session.set(uid, dc, session);
      }
      return session;
    },
    set(uid, dc, session) {
      getConfig(uid).session[dc] = session;
    }
  },
  rootEmitter: uid => getConfig(uid).rootEmitter,
  emit: uid => getConfig(uid).emit,
  layer: {
    apiLayer: uid => getConfig(uid).layer.apiLayer,
    mtLayer: uid => getConfig(uid).layer.mtLayer
  },
  schema: {
    get: uid => getConfig(uid).schema,
    apiSchema: uid => getConfig(uid).schema.apiSchema,
    mtSchema: uid => getConfig(uid).schema.mtSchema
  },
  timerOffset: {
    get: uid => getConfig(uid).timerOffset,
    set(uid, value) {
      getConfig(uid).timerOffset = value;
    }
  },
  lastMessageID: {
    get: uid => getConfig(uid).lastMessageID,
    set(uid, value) {
      getConfig(uid).lastMessageID = value;
    }
  },
  dcMap(uid, id) {
    var dc = getConfig(uid).dcMap.get(id);
    if (typeof dc !== 'string') throw new Error(`Wrong dc id! ${id}`);
    return dc;
  },
  dcList(uid) {
    return [...getConfig(uid).dcMap.keys()];
  },
  common: getCrypto()
};

export default Config;
//# sourceMappingURL=facade.js.map