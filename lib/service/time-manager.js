'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateID = exports.applyServerTime = exports.tsNow = undefined;

var _runtime = require('../runtime');

var _bin = require('../bin');

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`time-manager`;

var tsNow = exports.tsNow = () => {
  var t = Date.now();
  //eslint-disable-next-line
  if (!_runtime.isNode) t += window.tsOffset || 0;
  return t;
};

var generateMessageID = uid => {
  var timeTicks = tsNow(),
      timeSec = Math.floor(timeTicks / 1000) + _configProvider2.default.timerOffset.get(uid),
      random = (0, _bin.nextRandomInt)(0xFFFF);

  var messageID = [timeSec, timeTicks % 1000 << 21 | random << 3 | 4];
  var lastMessageID = _configProvider2.default.lastMessageID.get(uid);
  if (lastMessageID[0] > messageID[0] || lastMessageID[0] == messageID[0] && lastMessageID[1] >= messageID[1]) {
    messageID = [lastMessageID[0], lastMessageID[1] + 4];
  }
  _configProvider2.default.lastMessageID.set(uid, messageID);

  // console.log('generated msg id', messageID, timerOffset)

  return (0, _bin.lshift32)(messageID[0], messageID[1]);
};

var applyServerTime = exports.applyServerTime = (uid, serverTime, localTime) => {

  var newTimeOffset = serverTime - Math.floor((localTime || tsNow()) / 1000);
  var changed = Math.abs(_configProvider2.default.timerOffset.get(uid) - newTimeOffset) > 10;

  _configProvider2.default.lastMessageID.set(uid, [0, 0]);
  _configProvider2.default.timerOffset.set(uid, newTimeOffset);
  log`Apply server time`(serverTime, localTime, newTimeOffset, changed);

  return changed;
};

exports.generateID = generateMessageID;
//# sourceMappingURL=time-manager.js.map