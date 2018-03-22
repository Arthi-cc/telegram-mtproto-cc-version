'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makePasswordHash = makePasswordHash;
exports.getRandomId = getRandomId;

var _bin = require('../bin');

/**
 * ### Make hash from user password string
 *
 * Used in methods `auth.checkPassword`, `account.getPasswordSettings`, `account.updatePasswordSettings` and some other
 *
 * **Usage**:
 *
 *     const makePasswordHash =
 *       require('telegram-mtproto').plugins.makePasswordHash
 *     const { current_salt } = await telegram('account.getPassword')
 *     const hash = makePasswordHash(current_salt, userPassword)
 *     const result = await telegram('auth.checkPassword', {
 *       password_hash: hash,
 *     })
 *
 * @param {(Uint8Array | number[])} salt
 * @param {string} password
 * @returns {number[]} bytes
 */
function makePasswordHash(salt, password) {
  var passwordUTF8 = decodeURIComponent(escape(password));
  var buffer = new ArrayBuffer(passwordUTF8.length);
  var byteView = new Uint8Array(buffer);
  var len = passwordUTF8.length;
  for (var i = 0; i < len; i++) {
    byteView[i] = passwordUTF8.charCodeAt(i);
  }buffer = (0, _bin.bufferConcat)((0, _bin.bufferConcat)(salt, byteView), salt);

  return (0, _bin.sha256HashSync)(buffer);
}

/**
 * ### Create new `random_id` value
 *
 * Useful for many methods, including `messages.sendMessage`, `messages.sendMedia`,
 * `messages.forwardMessage` etc.
 *
 * @export
 * @returns {number[]}
 */


function getRandomId() {
  return [(0, _bin.nextRandomInt)(0xFFFFFFFF), (0, _bin.nextRandomInt)(0xFFFFFFFF)];
}
//# sourceMappingURL=math-help.js.map