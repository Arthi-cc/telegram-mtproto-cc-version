import tasks from './tasks';


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
      return tasks.factorize;
    case 'mod-pow':
      return tasks.modPow;
    case 'sha1-hash':
      return tasks.sha1Hash;
    case 'aes-encrypt':
      return tasks.aesEncrypt;
    case 'aes-decrypt':
      return tasks.aesDecrypt;
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