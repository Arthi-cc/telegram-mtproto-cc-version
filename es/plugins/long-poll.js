function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import Bluebird from 'bluebird';
import { encaseP2, cache } from 'fluture';

import { tsNow } from '../service/time-manager';
/*:: import { NetworkerThread } from '../service/networker' */

import Logger from 'mtproto-logger';
var log = Logger`long-poll`;
import Config from '../config-provider';

function longPollRequest(thread, maxWait) {
  return thread.wrapMtpCall('http_wait', {
    max_delay: 0,
    wait_after: 200,
    max_wait: maxWait
  }, requestOpts);
}

var futureRequest = (thread, maxWait) => encaseP2(longPollRequest, thread, maxWait);

/*::
declare var fakeThread: NetworkerThread
const future = futureRequest(fakeThread, 25e3)
type FutureRequest = typeof future
*/

export default class LongPoll {
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
    if (!this.currentRequest) this.currentRequest = cache(futureRequest(this.thread, this.maxWait).map(x => {
      delete this.currentRequest;
      this.thread.checkLongPoll();
      this.pending;
    }));
    return this.currentRequest.promise();
  }

  setPendingTime() {
    var now = tsNow();
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
    this.requestTime = tsNow();
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
      if (Config.halt.get(_this2.thread.uid, _this2.thread.dcID)) return Bluebird.resolve(false);
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

var requestOpts = {
  noResponse: true,
  longPoll: true,
  notContentRelated: true
};
//# sourceMappingURL=long-poll.js.map