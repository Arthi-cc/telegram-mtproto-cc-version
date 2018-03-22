import { Fluture } from 'fluture';
import 'eventemitter2';
import 'mtproto-shared';

import { ProviderRegistryError } from '../error';
import '../tl/index.h';
import '../newtype.h';
import '../service/main/index.h';
import ScopedEmitter from '../event/scoped-emitter';
import NetworkerThread from '../service/networker';
import Layout from '../layout';
import L1Cache from '../l1-cache';
import StorageAdapter from '../storage-adapter';

var provider = {};

export function getConfig(uid) {
  var config = provider[uid];
  if (config == null) throw new ProviderRegistryError(uid);
  return config;
}

export function registerInstance(config) {
  var fullConfig = Object.assign({}, config, {
    keyManager: keyManagerNotInited,
    //$off
    storageAdapter: new StorageAdapter(config.storage),
    timerOffset: 0,
    seq: {},
    session: {},
    fastCache: {},
    thread: {},
    authRequest: {},
    halt: {},
    publicKeys: {},
    lastMessageID: [0, 0]
  });
  provider[fullConfig.uid] = fullConfig;
}

function keyManagerNotInited() {
  throw new Error(`Key manager not inited`);
}
//# sourceMappingURL=provider.js.map