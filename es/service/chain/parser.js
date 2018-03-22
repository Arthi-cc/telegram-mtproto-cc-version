function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { readResponse, getDataWithPad, readHash, parsedResponse } from './parse-response';
import { Deserialization } from '../../tl';
import { NetMessage } from '../networker/net-message';

import '../../newtype.h';

import { convertToUint8Array } from '../../bin';

export default (() => {
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

    var { msgKey, encryptedData } = readResponse({
      reader: new Deserialization(responseBuffer, {}, uid),
      response: responseBuffer,
      authKeyStored: [...authKeyID]
    });

    var dataWithPadding = yield getDataWithPad({
      authKey: convertToUint8Array(authKey),
      msgKey,
      encryptedData
    });

    var {
      hashData,
      seqNo,
      messageID,
      buffer,
      sessionID
    } = readHash({
      reader: new Deserialization(dataWithPadding, { mtproto: true }, uid),
      currentSession: thisSessionID,
      prevSession: prevSessionID,
      dataWithPadding,
      uid
    });

    //$FlowIssue
    var response = yield parsedResponse({
      hashData,
      msgKey,
      reader: new Deserialization(buffer, {
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