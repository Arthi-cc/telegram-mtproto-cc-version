'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parseResponse = require('./parse-response');

var _tl = require('../../tl');

var _netMessage = require('../networker/net-message');

require('../../newtype.h');

var _bin = require('../../bin');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
  var _ref = _asyncToGenerator(function* ({
    responseBuffer,
    uid,
    dc,
    authKeyID,
    authKey,
    thisSessionID,
    prevSessionID,
    getMsgById
  }) {

    var { msgKey, encryptedData } = (0, _parseResponse.readResponse)({
      reader: new _tl.Deserialization(responseBuffer, {}, uid),
      response: responseBuffer,
      authKeyStored: [...authKeyID]
    });

    var dataWithPadding = yield (0, _parseResponse.getDataWithPad)({
      authKey: (0, _bin.convertToUint8Array)(authKey),
      msgKey,
      encryptedData
    });

    var {
      hashData,
      seqNo,
      messageID,
      buffer,
      sessionID
    } = (0, _parseResponse.readHash)({
      reader: new _tl.Deserialization(dataWithPadding, { mtproto: true }, uid),
      currentSession: thisSessionID,
      prevSession: prevSessionID,
      dataWithPadding,
      uid
    });

    //$FlowIssue
    var response = yield (0, _parseResponse.parsedResponse)({
      hashData,
      msgKey,
      reader: new _tl.Deserialization(buffer, {
        mtproto: true,
        getter: getMsgById }, uid)
    });

    return {
      response,
      messageID,
      sessionID,
      seqNo
    };
  });

  return function parser(_x) {
    return _ref.apply(this, arguments);
  };
})();
//# sourceMappingURL=parser.js.map