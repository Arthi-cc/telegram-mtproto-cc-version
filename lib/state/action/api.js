'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.API = undefined;

var _helpers = require('../helpers');

require('../../task/index.h');

require('../index.h');

var apiMeta = (_, id) => ({ _: 'api', id });

var API = exports.API = {
  REQUEST: {
    NEW: (0, _helpers.doubleCreator)('api/request new', apiMeta),
    DONE: (0, _helpers.doubleCreator)('api/request done')
  },
  TASK: {
    NEW: (0, _helpers.doubleCreator)('api/task new'),
    DONE: (0, _helpers.doubleCreator)('api/task done')
  },
  NEXT: (0, _helpers.doubleCreator)('api/next')
};
//# sourceMappingURL=api.js.map