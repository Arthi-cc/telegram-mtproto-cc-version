'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defer = require('../util/defer');

var _defer2 = _interopRequireDefault(_defer);

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`web-worker`;

class Webworker {
  static of() {
    return new Webworker();
  }

  constructor() {
    this.taskCount = 0;
    this.awaiting = {};

    this.initWorker();
    this.worker.postMessage('b');
  }

  getNextID() {
    return this.taskCount++;
  }

  run(taskType, data) {
    var task = {
      task: taskType,
      taskID: this.getNextID(),
      data
    };
    return this.addTaskAwait(task);
  }

  addTaskAwait(task) {
    this.awaiting[task.taskID] = (0, _defer2.default)();
    this.worker.postMessage(task);
    return this.awaiting[task.taskID].promise;
  }

  initWorker() {
    this.worker = getWorker();

    this.worker.onmessage = ({ data }) => {
      if (typeof data === 'string') {
        data === 'ready' ? log`init`('CW ready') : log`init`('Unknown worker message', data);
      } else if (!isCryptoTask(data)) {
        log`init`('Not crypto task', data);
      } else {
        this.resolveTask(data.taskID, data.result);
      }
    };
    this.worker.onerror = err => {
      log`error`(err);
    };
  }

  resolveTask(taskID, result) {
    var defer = this.awaiting[taskID];
    if (!defer) {
      log`resolve task, error`(`No stored task ${taskID} found`);
      return;
    }
    delete this.awaiting[taskID];
    defer.resolve(result);
  }
}

exports.default = Webworker;
function isCryptoTask(obj) {
  return typeof obj === 'object' && typeof obj.taskID === 'number';
}

function getWorker() {
  var WorkerInstance = void 0;
  try {
    //$FlowIssue
    WorkerInstance = require('worker-loader?inline&fallback=false!./worker.js');
  } catch (err) {
    console.error(err);
    WorkerInstance = require('./worker.js');
  }
  //$FlowIssue
  var worker = new WorkerInstance();
  return worker;
}
//# sourceMappingURL=web-worker.js.map