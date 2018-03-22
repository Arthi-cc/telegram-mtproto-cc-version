'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apropos = require('apropos');

require('../service/main/index.h');

require('../newtype.h');

var _coWorker = require('../co-worker');

var _coWorker2 = _interopRequireDefault(_coWorker);

var _provider = require('./provider');

var _secureRandom = require('../service/secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _rsaKeysManger = require('../service/authorizer/rsa-keys-manger');

var _rsaKeysManger2 = _interopRequireDefault(_rsaKeysManger);

var _networker = require('../service/networker');

var _networker2 = _interopRequireDefault(_networker);

var _l1Cache = require('../l1-cache');

var _l1Cache2 = _interopRequireDefault(_l1Cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var { fromNullable } = _apropos.Maybe;

// import { Just, Nothing, fromNullable, Maybe } from 'folktale/maybe'

var Config = {
  halt: {
    get(uid, dc) {
      var val = (0, _provider.getConfig)(uid).halt[dc];
      if (typeof val !== 'boolean') {
        Config.halt.set(uid, dc, false);
        return false;
      }
      return val;
    },
    set(uid, dc, val) {
      (0, _provider.getConfig)(uid).halt[dc] = val;
    }
  },
  // invoke(method: string, params: Object = {}, opts: Object = {}) {
  //
  // },
  seq: {
    get(uid, dc) {
      var seq = (0, _provider.getConfig)(uid).seq[dc];
      if (typeof seq !== 'number') {
        Config.seq.set(uid, dc, 1);
        return 1;
      }
      return seq;
    },
    set(uid, dc, newSeq) {
      (0, _provider.getConfig)(uid).seq[dc] = newSeq;
    }
  },
  apiConfig: {
    get(uid) {
      return (0, _provider.getConfig)(uid).apiConfig;
    }
  },
  thread: {
    set(uid, dc, thread) {
      (0, _provider.getConfig)(uid).thread[dc] = thread;
    },
    get(uid, dc) {
      return fromNullable((0, _provider.getConfig)(uid).thread[dc]);
    }
  },
  storage: {
    get(uid, key) {
      return (0, _provider.getConfig)(uid).storage.get(key);
    },
    set(uid, key, value) {
      return (0, _provider.getConfig)(uid).storage.set(key, value);
    },
    has(uid, key) {
      return (0, _provider.getConfig)(uid).storage.has(key);
    },
    remove(uid, ...keys) {
      return (0, _provider.getConfig)(uid).storage.remove(...keys);
    }
  },
  storageAdapter: {
    get: {
      authKey(uid, dc) {
        return (0, _provider.getConfig)(uid).storageAdapter.getAuthKey(dc);
      },
      authID(uid, dc) {
        return (0, _provider.getConfig)(uid).storageAdapter.getAuthID(dc);
      },
      salt(uid, dc) {
        return (0, _provider.getConfig)(uid).storageAdapter.getSalt(dc);
      },
      dc(uid) {
        return (0, _provider.getConfig)(uid).storageAdapter.getDC();
      },
      nearestDC(uid) {
        return (0, _provider.getConfig)(uid).storageAdapter.getNearestDC();
      }
    },
    set: {
      authKey(uid, dc, data) {
        return (0, _provider.getConfig)(uid).storageAdapter.setAuthKey(dc, data);
      },
      authID(uid, dc, data) {
        return (0, _provider.getConfig)(uid).storageAdapter.setAuthID(dc, data);
      },
      salt(uid, dc, data) {
        return (0, _provider.getConfig)(uid).storageAdapter.setSalt(dc, data);
      },
      dc(uid, dc) {
        return (0, _provider.getConfig)(uid).storageAdapter.setDC(dc);
      },
      nearestDC(uid, dc) {
        return (0, _provider.getConfig)(uid).storageAdapter.setNearestDC(dc);
      }
    },
    remove: {
      authKey(uid, dc) {
        return (0, _provider.getConfig)(uid).storageAdapter.removeAuthKey(dc);
      },
      authID(uid, dc) {
        return (0, _provider.getConfig)(uid).storageAdapter.removeAuthID(dc);
      },
      salt(uid, dc) {
        return (0, _provider.getConfig)(uid).storageAdapter.removeSalt(dc);
      },
      dc(uid) {
        return (0, _provider.getConfig)(uid).storageAdapter.removeDC();
      },
      nearestDC(uid) {
        return (0, _provider.getConfig)(uid).storageAdapter.removeNearestDC();
      }
    }
  },
  fastCache: {
    get(uid, dc) {
      return (0, _provider.getConfig)(uid).fastCache[dc | 0];
    },
    init(uid, dc) {
      (0, _provider.getConfig)(uid).fastCache[dc | 0] = _l1Cache2.default.of();
    }
  },
  publicKeys: {
    get(uid, keyHex) {
      return (0, _provider.getConfig)(uid).publicKeys[keyHex] || false;
    },
    set(uid, keyHex, key) {
      (0, _provider.getConfig)(uid).publicKeys[keyHex] = key;
    },
    init(uid, keys) {
      (0, _provider.getConfig)(uid).keyManager = (0, _rsaKeysManger2.default)(uid, keys, Config.publicKeys);
    },
    select(uid, fingerprints) {
      return (0, _provider.getConfig)(uid).keyManager(fingerprints);
    }
  },
  authRequest: {
    get(uid, dc) {
      return (0, _provider.getConfig)(uid).authRequest[dc];
    },
    set(uid, dc, req) {
      (0, _provider.getConfig)(uid).authRequest[dc] = req;
    },
    remove(uid, dc) {
      delete (0, _provider.getConfig)(uid).authRequest[dc];
    }
  },
  session: {
    get(uid, dc) {
      var session = (0, _provider.getConfig)(uid).session[dc];
      if (!Array.isArray(session)) {
        session = new Array(8);
        (0, _secureRandom2.default)(session);
        Config.session.set(uid, dc, session);
      }
      return session;
    },
    set(uid, dc, session) {
      (0, _provider.getConfig)(uid).session[dc] = session;
    }
  },
  rootEmitter: uid => (0, _provider.getConfig)(uid).rootEmitter,
  emit: uid => (0, _provider.getConfig)(uid).emit,
  layer: {
    apiLayer: uid => (0, _provider.getConfig)(uid).layer.apiLayer,
    mtLayer: uid => (0, _provider.getConfig)(uid).layer.mtLayer
  },
  schema: {
    get: uid => (0, _provider.getConfig)(uid).schema,
    apiSchema: uid => (0, _provider.getConfig)(uid).schema.apiSchema,
    mtSchema: uid => (0, _provider.getConfig)(uid).schema.mtSchema
  },
  timerOffset: {
    get: uid => (0, _provider.getConfig)(uid).timerOffset,
    set(uid, value) {
      (0, _provider.getConfig)(uid).timerOffset = value;
    }
  },
  lastMessageID: {
    get: uid => (0, _provider.getConfig)(uid).lastMessageID,
    set(uid, value) {
      (0, _provider.getConfig)(uid).lastMessageID = value;
    }
  },
  dcMap(uid, id) {
    var dc = (0, _provider.getConfig)(uid).dcMap.get(id);
    if (typeof dc !== 'string') throw new Error(`Wrong dc id! ${id}`);
    return dc;
  },
  dcList(uid) {
    return [...(0, _provider.getConfig)(uid).dcMap.keys()];
  },
  common: (0, _coWorker2.default)()
};

exports.default = Config;
//# sourceMappingURL=facade.js.map