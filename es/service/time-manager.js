import { isNode } from '../runtime';

import { nextRandomInt, lshift32 } from '../bin';
import Config from '../config-provider';

import Logger from 'mtproto-logger';

var log = Logger`time-manager`;

export var tsNow = () => {
  var t = Date.now();
  //eslint-disable-next-line
  if (!isNode) t += window.tsOffset || 0;
  return t;
};

var generateMessageID = uid => {
  var timeTicks = tsNow(),
      timeSec = Math.floor(timeTicks / 1000) + Config.timerOffset.get(uid),
      random = nextRandomInt(0xFFFF);

  var messageID = [timeSec, timeTicks % 1000 << 21 | random << 3 | 4];
  var lastMessageID = Config.lastMessageID.get(uid);
  if (lastMessageID[0] > messageID[0] || lastMessageID[0] == messageID[0] && lastMessageID[1] >= messageID[1]) {
    messageID = [lastMessageID[0], lastMessageID[1] + 4];
  }
  Config.lastMessageID.set(uid, messageID);

  // console.log('generated msg id', messageID, timerOffset)

  return lshift32(messageID[0], messageID[1]);
};

export var applyServerTime = (uid, serverTime, localTime) => {

  var newTimeOffset = serverTime - Math.floor((localTime || tsNow()) / 1000);
  var changed = Math.abs(Config.timerOffset.get(uid) - newTimeOffset) > 10;

  Config.lastMessageID.set(uid, [0, 0]);
  Config.timerOffset.set(uid, newTimeOffset);
  log`Apply server time`(serverTime, localTime, newTimeOffset, changed);

  return changed;
};

export { generateMessageID as generateID };
//# sourceMappingURL=time-manager.js.map