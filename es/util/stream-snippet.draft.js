import { writeFileSync, ensureDirSync } from 'fs-extra';
import 'most';
import { join } from 'path';

var DIR = 'snippet';

var makeName = (name, index) => join('.', DIR, ...name, [index.toString(10), '.json'].join(''));

var makeSnippet = name => {
  ensureDirSync(join('.', DIR, ...name));
  return (filter, epic) => action$ => {
    var mcast = action$.thru(filter).multicast();
    var raw = epic(mcast);
    var counter = mcast.scan(n => n + 1, 0).skip(1);
    mcast.zip((begin, end) => ({ begin, end }), raw).zip((data, count) => Object.assign({}, data, { count }), counter).observe(({ begin, end, count }) => {
      var fullName = makeName(name, count);
      var stringify = stringifyOnce({ begin, end }, 2, replacer);
      writeFileSync(fullName, stringify);
    });
    return raw;
  };
};

var isAxios = val => typeof val === 'object' && val != null && val.request != null && val.headers != null;

var printArrayBuffer = val => `ArrayBuffer [${new Int32Array(val).toString()}]`;

var replacer = (key, val) => {
  if (isAxios(val)) return printArrayBuffer(val.data);
  return val;
};

function stringifyOnce(obj, indent, replacer) {
  var printedObjects = [];
  var printedObjectKeys = [];

  return JSON.stringify(obj, function printOnceReplacer(key, value) {
    if (printedObjects.length > 2000) {
      // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
      return 'object too long';
    }
    var printedObjIndex = false;
    printedObjects.forEach((obj, index) => {
      if (obj === value) {
        printedObjIndex = index;
      }
    });

    if (key == '') {
      //root element
      printedObjects.push(obj);
      printedObjectKeys.push('root');
      return value;
    } else if (`${printedObjIndex}` != 'false' && typeof value == 'object') {
      if (printedObjectKeys[printedObjIndex] == 'root') {
        return '(root)';
      } else {
        return '(' + printedObjectKeys[printedObjIndex] + ' ' + (!!value && !!value.constructor ? value.constructor.name : typeof value) + ')';
      }
    } else {
      printedObjects.push(value);
      printedObjectKeys.push(key || '(empty key)');
      if (replacer) {
        return replacer(key, value);
      } else {
        return value;
      }
    }
  }, indent);
}

export default makeSnippet;
//# sourceMappingURL=stream-snippet.draft.js.map