'use strict';

var _tasks = require('./tasks');

var _tasks2 = _interopRequireDefault(_tasks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.info('Crypto worker registered');

var post = (() => {
  function postPlain(data) {
    postMessage(data);
  }
  var result = function postStar(data) {
    postMessage(data, '*');
  };
  try {
    result('ready');
  } catch (err) {
    result = postPlain;
    result('ready');
  } finally {
    //eslint-disable-next-line
    return result;
  }
})();

function selectTask(taskName) {
  switch (taskName) {
    case 'factorize':
      return _tasks2.default.factorize;
    case 'mod-pow':
      return _tasks2.default.modPow;
    case 'sha1-hash':
      return _tasks2.default.sha1Hash;
    case 'aes-encrypt':
      return _tasks2.default.aesEncrypt;
    case 'aes-decrypt':
      return _tasks2.default.aesDecrypt;
    default:
      throw new Error(`Unknown task: ${taskName}`);
  }
}

function runTask(ctx) {
  var { task, taskID, data } = ctx;
  var fn = selectTask(task);
  var result = fn(data);
  post({ taskID, result });
}

onmessage = msg => {
  if (typeof msg.data === 'string') {
    if (msg.data === '') console.info('empty crypto task');else console.info('crypto task string message', msg.data);
    return;
  }
  runTask(msg.data);
};
//# sourceMappingURL=worker.js.map