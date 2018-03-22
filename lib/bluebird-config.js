'use strict';

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//$FlowIssue
_bluebird2.default.config({
  warnings: {
    wForgottenReturn: false
  },
  longStackTraces: true,
  cancellation: true,
  monitoring: false
});
//# sourceMappingURL=bluebird-config.js.map