'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = warning;

var _ramda = require('ramda');

var _runtime = require('../runtime');

var objectFlagVariants = {
  browser: '%O',
  node: `\n%j\n`
};

var objectFlag = _runtime.isNode ? objectFlagVariants.node : objectFlagVariants.browser;

var newLine = `\n`;

var warnString = '!! WARNING !!';

var issueLink = 'https://github.com/zerobias/telegram-mtproto/issues';

var issueString = `This is most likely a problem with the telegram-mtproto itself.
Feel free to create an issue here ${issueLink}`;

function prepareMessage(message) {
  if (typeof message === 'string') return [message];
  if (message.length === 1) return [message[0], objectFlag];
  return (0, _ramda.intersperse)(objectFlag, message);
}

function getMessage({ isIssue, message }) {
  var parts = [warnString, newLine];
  parts = parts.concat(prepareMessage(message));
  if (isIssue) parts.push(newLine, issueString);
  parts.push(newLine);
  return parts.join('');
}

function warning(spec) {
  var message = getMessage(spec);
  return function doWarn(...data) {
    console.warn(message, ...data);
  };
}
//# sourceMappingURL=warning.js.map