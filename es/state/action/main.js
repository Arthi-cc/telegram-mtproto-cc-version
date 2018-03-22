import { doubleCreator } from '../helpers';


var onDc = dc => ({
  _: 'networker',
  id: dc
});

export var MAIN = {
  INIT: doubleCreator('main/init'),
  STORAGE_IMPORTED: doubleCreator('main/storage imported'),
  MODULE_LOADED: doubleCreator('main/module loaded', () => ({
    _: 'networker',
    id: 2
  })),
  DC_DETECTED: doubleCreator('main/dc detected'),
  DC_REJECTED: doubleCreator('main/dc rejected'),
  ACTIVATED: doubleCreator('main/instance activated'),
  DC_CHANGED: doubleCreator('main/dc changed', onDc),
  AUTH_UNREG: doubleCreator('main/auth unreg', onDc),
  RECOVERY_MODE: doubleCreator('main/recovery mode'),
  AUTH: {
    RESOLVE: doubleCreator('main/auth resolve')
  }
};
//# sourceMappingURL=main.js.map