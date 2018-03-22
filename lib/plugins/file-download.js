'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var CHUNK_SIZE = 10240;


var usedMethod = 'upload.getFile';

// const downloadFilePart = (
//   location,
//   chunkNum: number = 0,
//   telegram
// ) => {
//   const args = {
//     location,
//     offset: CHUNK_SIZE * chunkNum,
//     limit : CHUNK_SIZE,
//   }
//   return telegram(usedMethod, args)
// }

var getOffset = (chunkNum = 0) => CHUNK_SIZE * chunkNum;

var getArgs = (location, offset) => ({
  location,
  offset,
  limit: CHUNK_SIZE
});

var getLocation = doc => ({
  _: 'inputDocumentFileLocation',
  id: doc.id,
  access_hash: doc.access_hash
});

var downloadDocument = ctx => (() => {
  var _ref = _asyncToGenerator(function* (doc) {
    // console.dir(ctx, { colors: true })
    var location = getLocation(doc);
    var parts = Math.ceil(doc.size / CHUNK_SIZE);
    var results = new Uint8Array(doc.size);
    for (var i = 0; i < parts; i++) {
      var offset = getOffset(i);
      var args = getArgs(location, offset);
      var response = yield ctx.api.mtpInvokeApi(usedMethod, args);
      //TODO mtpInvokeApi was removed!
      results.set(response.bytes, offset);
    }
    return results;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

downloadDocument.pluginName = 'loadFile';

exports.default = downloadDocument;
//# sourceMappingURL=file-download.js.map