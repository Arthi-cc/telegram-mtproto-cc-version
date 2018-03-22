var getMsgKeyIv = (() => {
  var _ref = _asyncToGenerator(function* (authKey, msgKey, isOut) {
    var x = isOut ? 0 : 8;
    var sha1aText = new Uint8Array(48);
    var sha1bText = new Uint8Array(48);
    var sha1cText = new Uint8Array(48);
    var sha1dText = new Uint8Array(48);
    var promises = [];

    sha1aText.set(msgKey, 0);
    sha1aText.set(authKey.subarray(x, x + 32), 16);
    promises.push(CryptoWorker.sha1Hash(sha1aText));

    sha1bText.set(authKey.subarray(x + 32, x + 48), 0);
    sha1bText.set(msgKey, 16);
    sha1bText.set(authKey.subarray(x + 48, x + 64), 32);
    promises.push(CryptoWorker.sha1Hash(sha1bText));

    sha1cText.set(authKey.subarray(x + 64, x + 96), 0);
    sha1cText.set(msgKey, 32);
    promises.push(CryptoWorker.sha1Hash(sha1cText));

    sha1dText.set(msgKey, 0);
    sha1dText.set(authKey.subarray(x + 96, x + 128), 16);
    promises.push(CryptoWorker.sha1Hash(sha1dText));

    var results = yield Promise.all(promises);
    var aesKey = new Uint8Array(32),
        aesIv = new Uint8Array(32),
        sha1a = new Uint8Array(results[0]),
        sha1b = new Uint8Array(results[1]),
        sha1c = new Uint8Array(results[2]),
        sha1d = new Uint8Array(results[3]);

    aesKey.set(sha1a.subarray(0, 8));
    aesKey.set(sha1b.subarray(8, 20), 8);
    aesKey.set(sha1c.subarray(4, 16), 20);

    aesIv.set(sha1a.subarray(8, 20));
    aesIv.set(sha1b.subarray(0, 8), 12);
    aesIv.set(sha1c.subarray(16, 20), 20);
    aesIv.set(sha1d.subarray(0, 8), 24);

    return [aesKey, aesIv];
  });

  return function getMsgKeyIv(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import CryptoWorker from '../../crypto';

export default getMsgKeyIv;
//# sourceMappingURL=msg-key.js.map