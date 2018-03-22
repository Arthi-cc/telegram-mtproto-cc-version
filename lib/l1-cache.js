'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _netMessage = require('./service/networker/net-message');

class L1Cache {
  constructor() {
    this.sent = new Map();
    this.pending = new Map();
    this.resend = new Set();
    this.messages = new Map();
  }

  addResend(msg_id) {
    return this.resend.add(msg_id);
  }
  hasResends() {
    return this.resend.size > 0;
  }
  deleteResent(msg_id) {
    return this.resend.delete(msg_id);
  }
  getResends() {
    return this.resend.values();
  }

  addSent(message) {
    this.sent.set(message.msg_id, message);
  }
  getSent(msg_id) {
    //$FlowIssue
    return this.sent.get(msg_id);
  }
  hasSent(msg_id) {
    return this.sent.has(msg_id);
  }
  deleteSent(message) {
    return this.sent.delete(message.msg_id);
  }
  sentIterator() {
    return this.sent.entries();
  }

  setPending(msg_id, value = 0) {
    return this.pending.set(msg_id, value);
  }
  hasPending(msg_id) {
    return this.pending.has(msg_id);
  }
  deletePending(msg_id) {
    return this.pending.delete(msg_id);
  }
  pendingIterator() {
    return this.pending.entries();
  }

  static of() {
    return new L1Cache();
  }
}
exports.default = L1Cache;
//# sourceMappingURL=l1-cache.js.map