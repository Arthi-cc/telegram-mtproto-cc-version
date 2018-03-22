function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import './index.h';
import { initFlags, isApiObject } from './fixtures';
import { resolveRequest } from '../state/query';
import { MaybeT } from '../util/monad-t';

export default function processing(ctx, list) {
  return list.map(msg => processSingle(ctx, msg));
}

//$off
function processSingle(ctx, msg) {
  var _getIncoming = getIncoming(),
      { flags } = _getIncoming,
      body = _objectWithoutProperties(_getIncoming, ['flags']);
  flags = initFlags(flags);
  switch (msg.type) {
    case 'container':
      {
        flags = Object.assign({}, flags, { container: true });
        var contains = msg.raw;
        body = Object.assign({}, body, { container: { contains } });
        break;
      }
    case 'inner':
      {
        flags = Object.assign({}, flags, { inner: true });
        body = Object.assign({}, body, { inner: { container: ctx.messageID } });
        var data = msg.raw;
        if (hasBody(data)) {
          var insideInner = data.body;
          var { flagsResult, accResult } = processInners(ctx, msg, insideInner);
          flags = Object.assign({}, flags, flagsResult);
          if (accResult != null) body = Object.assign({}, body, accResult);
        }
        break;
      }
    case 'object':
      {
        var _data = msg.raw;
        var { flagsResult: _flagsResult, accResult: _accResult } = processInners(ctx, msg, _data);
        flags = Object.assign({}, flags, _flagsResult);
        if (_accResult != null) body = Object.assign({}, body, _accResult);
        break;
      }
    default:
      {
        throw new TypeError(`Wrong draft type ${msg.type}`);
      }
  }
  return Object.assign({ flags }, body, omitRaw(msg));
}

var omitRaw = (_ref) => {
  var { raw, type } = _ref,
      msg = _objectWithoutProperties(_ref, ['raw', 'type']);

  return msg;
};

function processInners(ctx, msg, body) {
  switch (body._) {
    case 'rpc_result':
      {
        return processRpc(ctx, msg, body);
        //$FlowIssue
      }
    default:
      {
        return {
          flagsResult: { body: true },
          accResult: { body }
        };
      }
  }
}

function processRpc(ctx, msg, body) {
  var outID = body.req_msg_id;
  var { uid, dc } = ctx;
  var flagsResult = {
    body: false,
    methodResult: true,
    api: true
  };
  var accResult = {
    methodResult: { outID }
  };
  var rslt = body.result;
  if (isApiObject(rslt)) {
    flagsResult = Object.assign({}, flagsResult, {
      body: true
    });
    var maybeApiID = resolveRequest(uid, dc, outID);
    var apiID = '',
        resolved = false;
    if (MaybeT.isJust(maybeApiID)) {
      apiID = MaybeT.unsafeGet(maybeApiID);
      resolved = true;
    }
    accResult = Object.assign({}, accResult, {
      body: rslt,
      api: {
        resolved,
        apiID
      }
    });
    if (rslt._ === 'rpc_error') {
      flagsResult = Object.assign({}, flagsResult, {
        error: true
      });
      accResult = Object.assign({}, accResult, {
        error: {
          code: rslt.error_code /*:: || 1 */
          , message: rslt.error_message /*:: || '' */
          , handled: false
        }
      });
    }
  }
  return {
    flagsResult,
    accResult
  };
}

function hasBody(msg) {
  return isApiObject(msg) && isApiObject(msg.body);
}

var getIncoming = () => ({
  flags: {
    incoming: true
  },
  incoming: {
    timestamp: Date.now()
  }
});
//# sourceMappingURL=processing.js.map