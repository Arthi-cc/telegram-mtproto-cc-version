'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blueDefer = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// export type Defer = $Shape<Bluebird.Defer>

var filler = value => {
  throw new Error(`Filler must not be called!`);
};

/**
 * Defered promise like in Q and $q
 */


var blueDefer = exports.blueDefer = () => {
  var resolve = filler,
      reject = filler;
  var promise = new _bluebird2.default((rs, rj) => {
    resolve = rs;
    reject = rj;
  });
  return {
    resolve,
    reject,
    promise
  };
};

exports.default = blueDefer;
//# sourceMappingURL=defer.js.map