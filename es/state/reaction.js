import Config from '../config-provider';

export function requestNextSeq(uid, dc, notContentRelated) {
  var currentSeq = Config.seq.get(uid, dc);

  var seqNo = currentSeq * 2;
  var nextSeq = currentSeq;
  if (!notContentRelated) {
    seqNo++;
    nextSeq++;
  }

  Config.seq.set(uid, dc, nextSeq);
  // dispatch(NET.SEQ_SET({ dc, seq: nextSeq }), uid)
  return seqNo;
}
//# sourceMappingURL=reaction.js.map