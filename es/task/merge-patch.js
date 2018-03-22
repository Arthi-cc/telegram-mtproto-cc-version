function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// import { join } from 'path'
// import { outputJsonSync } from 'fs-extra'

import { mergeWith, concat, append, groupBy, pipe, map, last, filter, fromPairs, contains } from 'ramda';

import './index.h';

import singleHandler from './single-handler';

import Logger from 'mtproto-logger';
var log = Logger`merge-patch`;

// const testID = String((Date.now() - ((Date.now() / 1e8) | 0) * 1e8) / 1e3 | 0)

// let event = 0
// const eventId = () => String( ++event )
//
// const LOG_PATH = [process.cwd(), 'logs', testID]

export default function mergePatch(ctx, processed) {
  var { message, summary } = processed.reduce((acc, msg) => {
    var { message, summary } = singleHandler(ctx, msg);
    // const file = join(...LOG_PATH, eventId() + '.json')
    // outputJsonSync(file, { message, summary }, { spaces: 2 })
    return {
      message: append(message, acc.message),
      summary: append(summary, acc.summary)
    };
  }, { message: [], summary: [] });
  var mergedSummary = summary.reduce(mergeSummary, emptySummary());
  var regrouped = regroupSummary(mergedSummary);
  var noAuth = dcWithoutAuth(regrouped.auth);
  var { salt, session } = regrouped,
      omitSalt = _objectWithoutProperties(regrouped, ['salt', 'session']);
  var updatedSalt = Object.assign({}, salt, noAuth);
  var updatedSession = Object.assign({}, session, noAuth);
  var withNewSalt = Object.assign({}, omitSalt, {
    salt: updatedSalt,
    session: updatedSession
    // const joinedAuth = joinDcAuth(withNewSalt)
    // log`mergedSummary`(mergedSummary)
    // log`regrouped`(withNewSalt)
    // log`joinedAuth`(joinedAuth)
  });return {
    normalized: message,
    summary: withNewSalt
  };
}

var emptySummary = () => ({
  processAck: [],
  ack: [],
  home: [],
  auth: [],
  reqResend: [],
  resend: [],
  lastMessages: [],
  salt: [],
  session: []
});

//$off
var mergeSummary = mergeWith(concat);

//$off

var groupAndExtract = /*:: <T, S>*/fn => pipe(groupBy(({ dc } /*::(*/) => dc /*:: : $FlowIssue)*/), map(map(fn)));

var groupDcIds = groupAndExtract(e => e.id);
// const groupAuthKey: GroupAndExtract<ᐸPatchᐳAuthKey, number[] | false> = groupAndExtract(e => e.authKey)
// const groupSalt: GroupAndExtract<ᐸPatchᐳSalt, number[]> = groupAndExtract(e => e.salt)
// const groupSession: GroupAndExtract<ᐸPatchᐳSession, ᐸPatchᐳSession> = groupAndExtract(e => e)

function regroupSummary(summary) {
  var {
    processAck,
    ack,
    // home,
    // auth,
    reqResend
    // resend,
    // lastMessages,
    // salt,
    // session,
  } = summary;
  var regrouped = Object.assign({}, summary, {
    processAck: groupDcIds(processAck),
    ack: groupDcIds(ack),
    // home,
    // auth        : reduceToLast(groupAuthKey(auth)),
    reqResend: groupDcIds(reqResend)
    // resend      : groupDcIds(resend),
    // lastMessages: groupDcIds(lastMessages),
    // salt        : reduceToLast(groupSalt(salt)),
    // session     : reduceToLast(groupSession(session)),
  });

  return regrouped;
}

// type ReduceToLast = <T>(dcMap: { [dc: number]: T[] }) => { [dc: number]: T }
//$ off
// const reduceToLast: ReduceToLast = map(last)

//$off

var dcWithoutAuth = filter(e => e === false);

// const empty: any = {}
// const toDcs = obj => Object
//   .keys(obj)
//   .filter(isFinite)
//   .map(e => parseInt(e, 10))
//
// function joinDcAuth(summary) {
//   /*::
//   type AuthMap = typeof summary.auth
//   type SaltMap = typeof summary.salt
//   type SessionMap = typeof summary.session
//   */
//   const emptyAuth: AuthMap = empty
//   const emptySalt: SaltMap = empty
//   const emptySession: SessionMap = empty
//   const {
//     auth = emptyAuth,
//     salt = emptySalt,
//     session = emptySession,
//   } = summary
//   const authKeys = toDcs(auth)
//   const saltKeys = toDcs(salt)
//   const sessionKeys = toDcs(session)
//   const usedDcs = [...new Set([...authKeys, ...saltKeys, ...sessionKeys])]
//   const emptyDcAuth: DcAuth = /*::(*/{}/*:: : any)*/
//   let result: {
//     //$ off
//     [dc: number]: DcAuth
//   } = fromPairs(usedDcs.map(e => [e, emptyDcAuth]))
//   for (const dc of usedDcs) {
//     let dcAuth = result[dc]
//     const hasDc = contains(dc)
//     if (hasDc(authKeys))
//       dcAuth = { ...dcAuth, auth: auth[dc] }
//     if (hasDc(saltKeys))
//       dcAuth = { ...dcAuth, salt: salt[dc] }
//     if (hasDc(sessionKeys))
//       dcAuth = { ...dcAuth, session: session[dc] }
//     result = { ...result, [dc]: dcAuth }
//   }
//   return result
// }
//# sourceMappingURL=merge-patch.js.map