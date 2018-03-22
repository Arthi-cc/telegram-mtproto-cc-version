import { Fluture } from 'fluture';
import { MTError } from '../../error';

import Main from './index';

import invoke from '../invoke';
import './index.h';

import '../../newtype.h';

export default function MTProto(config = {}) {
  var mtproto = new Main(config);
  var uid = mtproto.uid;

  function telegram(method, params, options) {
    return invoke(uid, method, params, options).promise();
  }

  telegram.on = mtproto.on;
  telegram.emit = mtproto.emit;
  telegram.storage = mtproto.storage;
  telegram.uid = mtproto.uid;
  telegram.bus = mtproto.bus;
  telegram.mtproto = mtproto;
  telegram.future = function futureRequest(method, params, options) {
    return invoke(uid, method, params, options);
  };

  return telegram;
}
//# sourceMappingURL=wrap.js.map