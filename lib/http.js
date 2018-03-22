'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.send = exports.httpClient = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _fluture = require('fluture');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var httpClient = exports.httpClient = _axios2.default.create();
//$FlowIssue
delete httpClient.defaults.headers.post['Content-Type'];
//$FlowIssue
delete httpClient.defaults.headers.common['Accept'];

var requestOptions = { responseType: 'arraybuffer' };

var request = (url, data) => httpClient.post(url, data, requestOptions);

var send = exports.send = (0, _fluture.encaseP2)(request);

// export function unwrapPromise<L, R>(
//   either: Apropos<L, Promise<R>>
// ): Promise<Apropos<L, R>> {
//   return either.fold(e => Promise.resolve(Left(e)), x => x.then(Right))
// }

exports.default = httpClient;
//# sourceMappingURL=http.js.map