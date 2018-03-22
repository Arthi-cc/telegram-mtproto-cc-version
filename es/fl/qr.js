

var dcs = [2, 3, 5];

var homeDc = 2;
var dcHome = [true, false, false];

var msgs = ['aa', 'bb', 'dd', 'zz'];
var msgAcks = [true, false, false, true];
var msgDc = [2, 2, 3, 5];

var ackMsgs = [0, 3];
var ackApi = [1];
var ackResp = ['ee', 'ff'];

var flags = {
  dc: true,
  msg: true,
  ack: {
    api: [1]
  },
  salt: false
};

var msgList = [{
  dc: 2,
  id: 'aa',
  ack: true
}, {
  dc: 2,
  id: 'bb',
  ack: false
}, {
  dc: 3,
  id: 'dd',
  ack: false
}, {
  dc: 5,
  id: 'zz',
  ack: true
}];

var dcList = [{
  id: 2,
  msgs: [0, 1],
  ack: [0]
}, {
  id: 3,
  msgs: [2],
  ack: [0]
}, {
  id: 5,
  msgs: [3],
  ack: [1]
}];

var ackList = [{
  dc: 2,
  id: 'aa',
  ack: true,
  resp: 'ee'
}, {
  dc: 5,
  id: 'zz',
  ack: true,
  resp: 'ff',
  api: 'sign.In'
}];
//# sourceMappingURL=qr.js.map