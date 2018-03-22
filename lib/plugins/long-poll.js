'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fluture = require('fluture');

var _timeManager = require('../service/time-manager');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/*:: import { NetworkerThread } from '../service/networker' */

var log = _mtprotoLogger2.default`long-poll`;


function longPollRequest(thread, maxWait) {
  return thread.wrapMtpCall('http_wait', {
    max_delay: 0,
    wait_after: 200,
    max_wait: maxWait
  }, requestOpts);
}

var futureRequest = (thread, maxWait) => (0, _fluture.encaseP2)(longPollRequest, thread, maxWait);

/*::
declare var fakeThread: NetworkerThread
const future = futureRequest(fakeThread, 25e3)
type FutureRequest = typeof future
*/

class LongPoll {
  constructor(thread) {
    this.maxWait = 15e3;
    this.pendingTime = Date.now();
    this.requestTime = Date.now();
    this.alreadyWaitPending = false;

    this.thread = thread;
    // if (inited) {
    //   log('Networker')(thread)
    //   //$ FlowIssue
    //   this.request = () => Bluebird.resolve()
    // }
    // inited = true
  }
  get pending() {
    if (!this.currentRequest) this.currentRequest = (0, _fluture.cache)(futureRequest(this.thread, this.maxWait).map(x => {
      delete this.currentRequest;
      this.thread.checkLongPoll();
      this.pending;
    }));
    return this.currentRequest.promise();
  }

  setPendingTime() {
    var now = (0, _timeManager.tsNow)();
    this.requestTime = now;
    this.pendingTime = now + this.maxWait;
  }

  request() {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _this.pending;
    })();
  }

  writePollTime() {
    this.requestTime = (0, _timeManager.tsNow)();
  }

  allowLongPoll() {
    return true;
    // const result = this.requestTime + WAIT < tsNow()
    // log`allow long poll`(result)
    // return result
  }
  // async sending() {
  //   this.alreadyWaitPending = true
  //   await waitToTime(this)
  //   this.alreadyWaitPending = false
  //   this.setPendingTime()
  //   const result = await this.request()
  //   return result
  // }
  sendLongPool() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      //TODO add base dc check
      if (_configProvider2.default.halt.get(_this2.thread.uid, _this2.thread.dcID)) return _bluebird2.default.resolve(false);
      // return cache(futureRequest(this.thread, this.maxWait)
      //   .map(x => {
      //     log`poll response`(x)
      //     // delete this.currentRequest
      //     this.thread.checkLongPoll()
      //     // this.pending
      //   })).promise()
      // if (this.allowLongPoll()) {
      //   this.pending = this.sending()
      // }

      var result = yield _this2.pending;
      return result;
    })();
  }
}

exports.default = LongPoll;
var requestOpts = {
  noResponse: true,
  longPoll: true,
  notContentRelated: true
};
//# sourceMappingURL=long-poll.js.map