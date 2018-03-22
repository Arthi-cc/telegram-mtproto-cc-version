'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MAIN = undefined;

var _helpers = require('../helpers');

var onDc = dc => ({
  _: 'networker',
  id: dc
});

var MAIN = exports.MAIN = {
  INIT: (0, _helpers.doubleCreator)('main/init'),
  STORAGE_IMPORTED: (0, _helpers.doubleCreator)('main/storage imported'),
  MODULE_LOADED: (0, _helpers.doubleCreator)('main/module loaded', () => ({
    _: 'networker',
    id: 2
  })),
  DC_DETECTED: (0, _helpers.doubleCreator)('main/dc detected'),
  DC_REJECTED: (0, _helpers.doubleCreator)('main/dc rejected'),
  ACTIVATED: (0, _helpers.doubleCreator)('main/instance activated'),
  DC_CHANGED: (0, _helpers.doubleCreator)('main/dc changed', onDc),
  AUTH_UNREG: (0, _helpers.doubleCreator)('main/auth unreg', onDc),
  RECOVERY_MODE: (0, _helpers.doubleCreator)('main/recovery mode'),
  AUTH: {
    RESOLVE: (0, _helpers.doubleCreator)('main/auth resolve')
  }
};
//# sourceMappingURL=main.js.map