'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeWriter = exports.Deserialization = exports.Serialization = undefined;

var _typeBuffer = require('./type-buffer');

Object.defineProperty(exports, 'TypeWriter', {
  enumerable: true,
  get: function () {
    return _typeBuffer.TypeWriter;
  }
});

var _eventemitter = require('eventemitter2');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _mtprotoShared = require('mtproto-shared');

var _bin = require('../bin');

var _reader = require('./reader');

var _writer = require('./writer');

var _layout = require('../layout');

var _layout2 = _interopRequireDefault(_layout);

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

var _netMessage = require('../service/networker/net-message');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logr = _mtprotoLogger2.default`tl,read`;

// const storeMethodLog = writer('storeMethod')
// const fetchObjectLog = writer('fetchObject')

var PACKED = 0x3072cfa1;

class Serialization {

  constructor({
    mtproto = false,
    startMaxLength = 2048 /* 2Kb */
  }, uid) {
    this.writer = new _typeBuffer.TypeWriter();


    this.uid = uid;

    this.writer.maxLength = startMaxLength;

    this.writer.reset();
    this.mtproto = mtproto;
  }

  getBytes(typed) {
    if (typed) return this.writer.getBytesTyped();else return this.writer.getBytesPlain();
  }
  getBytesPlain() {
    return this.writer.getBytesPlain();
  }

  storeMethod(methodName, params) {
    // const logId = storeMethodLog.input({
    //   methodName,
    //   params
    // })

    var layer = this.mtproto ? _configProvider2.default.layer.mtLayer(this.uid) : _configProvider2.default.layer.apiLayer(this.uid);
    var pred = layer.funcs.get(methodName);
    if (!pred) throw new Error(`No method name ${methodName} found`);

    (0, _writer.writeInt)(this.writer, (0, _bin.intToUint)(`${pred.id}`), `${methodName}[id]`);
    if (pred.hasFlags) {
      var flags = (0, _layout.getFlags)(pred)(params);
      this.storeObject(flags, '#', `f ${methodName} #flags ${flags}`);
    }
    for (var _iterator = pred.params, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var param = _ref;

      var paramName = param.name;
      var typeClass = param.typeClass;
      var fieldObj = void 0;
      if (typeof params[paramName] === 'undefined') {
        if (param.isFlag) continue;else if (layer.typeDefaults.has(typeClass)) fieldObj = layer.typeDefaults.get(typeClass);else if ((0, _layout.isSimpleType)(typeClass)) {
          switch (typeClass) {
            case 'int':
              fieldObj = 0;break;
            // case 'long': fieldObj = 0; break
            case 'string':
              fieldObj = ' ';break;
            // case 'double': fieldObj = 0; break
            case 'true':
              fieldObj = true;break;
            // case 'bytes': fieldObj = [0]; break
          }
        } else throw new Error(`Method ${methodName} did not receive required argument ${paramName}`);
      } else {
        fieldObj = params[paramName];
      }
      if (param.isVector) {
        if (!Array.isArray(fieldObj)) throw new TypeError(`Vector argument ${paramName} in ${methodName} required Array,` +
        //$FlowIssue
        ` got ${fieldObj} ${typeof fieldObj}`);
        (0, _writer.writeInt)(this.writer, 0x1cb5c415, `${paramName}[id]`);
        (0, _writer.writeInt)(this.writer, fieldObj.length, `${paramName}[count]`);
        for (var _iterator2 = fieldObj.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
          var _ref2;

          if (_isArray2) {
            if (_i2 >= _iterator2.length) break;
            _ref2 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done) break;
            _ref2 = _i2.value;
          }

          var [i, elem] = _ref2;

          this.storeObject(elem, param.typeClass, `${paramName}[${i}]`);
        }
      } else this.storeObject(fieldObj, param.typeClass, `f ${methodName}(${paramName})`);
    }
    /*let condType
    let fieldBit
    for (const param of methodData.params) {
      let type = param.type
      if (type.indexOf('?') !== -1) {
        condType = type.split('?')
        fieldBit = condType[0].split('.')
        if (!(params[fieldBit[0]] & 1 << fieldBit[1])) {
          continue
        }
        type = condType[1]
      }
      const paramName = param.name
      const stored = params[paramName]
      if (!stored)
        stored = this.emptyOfType(type, schema)
      if (!stored)
        throw new Error(`Method ${methodName}.`+
          ` No value of field ${ param.name } recieved and no Empty of type ${ param.type }`)
      this.storeObject(stored, type, `f ${methodName}(${paramName})`)
    }*/

    // storeMethodLog.output(logId, {
    //   pred,
    //   writer: this.writer
    // })
    return pred.returns;
  }
  /*emptyOfType(ofType, schema: TLSchema) {
    const resultConstruct = schema.constructors.find(
      ({ type, predicate }: TLConstruct) =>
        type === ofType &&
        predicate.indexOf('Empty') !== -1)
    return resultConstruct
      ? { _: resultConstruct.predicate }
      : null
  }*/
  storeObject(obj, type, field) {
    switch (type) {
      case '#':
      case 'int':
        return (0, _writer.writeInt)(this.writer, obj, field);
      case 'long':
        return (0, _writer.writeLong)(this.writer, obj, field);
      case 'int128':
        return (0, _writer.writeIntBytes)(this.writer, obj, 128);
      case 'int256':
        return (0, _writer.writeIntBytes)(this.writer, obj, 256);
      case 'int512':
        return (0, _writer.writeIntBytes)(this.writer, obj, 512);
      case 'string':
        return (0, _writer.writeBytes)(this.writer, obj);
      case 'bytes':
        return (0, _writer.writeBytes)(this.writer, obj);
      case 'double':
        return (0, _writer.writeDouble)(this.writer, obj, field);
      case 'Bool':
        return (0, _writer.writeBool)(this.writer, obj, field);
      case 'true':
        return;
    }

    if (Array.isArray(obj)) {
      if (type.substr(0, 6) == 'Vector') (0, _writer.writeInt)(this.writer, 0x1cb5c415, `${field}[id]`);else if (type.substr(0, 6) != 'vector') {
        throw new Error(`Invalid vector type ${type}`);
      }
      var itemType = type.substr(7, type.length - 8); // for "Vector<itemType>"
      (0, _writer.writeInt)(this.writer, obj.length, `${field}[count]`);
      for (var i = 0; i < obj.length; i++) {
        this.storeObject(obj[i], itemType, `${field}[${i}]`);
      }
      return true;
    } else if (type.substr(0, 6).toLowerCase() == 'vector') {
      throw new Error('Invalid vector object');
    }

    if (typeof obj !== 'object') throw new Error(`Invalid object for type ${type}`);

    var schema = this.mtproto ? _configProvider2.default.schema.mtSchema(this.uid) : _configProvider2.default.schema.apiSchema(this.uid);

    var predicate = obj['_'];
    var isBare = false;
    var constructorData = false;
    isBare = type.charAt(0) == '%';
    if (isBare) type = type.substr(1);

    for (var _iterator3 = schema.constructors, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray3) {
        if (_i3 >= _iterator3.length) break;
        _ref3 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) break;
        _ref3 = _i3.value;
      }

      var tlConst = _ref3;

      if (tlConst.predicate == predicate) {
        constructorData = tlConst;
        break;
      }
    }

    if (!constructorData) throw new Error(`No predicate ${predicate} found`);

    if (predicate == type) isBare = true;

    if (!isBare) (0, _writer.writeInt)(this.writer, (0, _bin.intToUint)(constructorData.id), `${field}.${predicate}[id]`);

    var condType = void 0;
    var fieldBit = void 0;

    for (var _iterator4 = constructorData.params, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray4) {
        if (_i4 >= _iterator4.length) break;
        _ref4 = _iterator4[_i4++];
      } else {
        _i4 = _iterator4.next();
        if (_i4.done) break;
        _ref4 = _i4.value;
      }

      var param = _ref4;

      type = param.type;
      if (type.indexOf('?') !== -1) {
        condType = type.split('?');
        fieldBit = condType[0].split('.');
        var flagIndex = parseInt(fieldBit[1], 10);
        if (!(obj.fiags & 1 << flagIndex)) {
          continue;
        }
        type = condType[1];
      }

      this.storeObject(obj[param.name], type, `${field}.${predicate}.${param.name}`);
    }
    if (typeof constructorData === 'boolean') return constructorData;
    return constructorData.type;
  }

}

exports.Serialization = Serialization;
var emitter = new _eventemitter2.default({ wildcard: true });

class Deserialization {
  /*:: override: * */
  constructor(buffer, {
    mtproto = false,
    override = {},
    getter
  }, uid) {
    this.readInt = field => (0, _reader.readInt)(this.typeBuffer, field);

    this.getter = getter;
    this.uid = uid;
    this.override = override;

    this.typeBuffer = new _typeBuffer.TypeBuffer(buffer);
    this.mtproto = mtproto;
    this.emitter = emitter;

    // const fetchObject = this.fetchObject.bind(this)

    // const mock = (type, field) => {
    //   const logId = fetchObjectLog.input({
    //     type,
    //     typeBuffer: this.typeBuffer,
    //     field
    //   })
    //   const result = fetchObject(type, field)
    //   fetchObjectLog.output(logId, {
    //     typeBuffer: this.typeBuffer,
    //     result
    //   })
    //   return result
    // }
    // this.fetchObject = mock
  }

  // log('int')(field, i.toString(16), i)


  fetchInt(field = '') {
    return this.readInt(`${field}:int`);
  }

  fetchBool(field = '') {
    var i = this.readInt(`${field}:bool`);
    switch (i) {
      case 0x997275b5:
        return true;
      case 0xbc799737:
        return false;
      default:
        {
          this.typeBuffer.offset -= 4;
          return this.fetchObject('Object', field);
        }
    }
  }
  fetchIntBytes(bitss, field = '') {
    var bits = bitss;
    if (Array.isArray(bits)) {
      console.trace();
      bits = bitss[0];
    }
    if (bits % 32) {
      console.error(bits, typeof bits, Array.isArray(bits));
      throw new Error(`Invalid bits: ${bits}`);
    }
    var len = bits / 8;

    var bytes = this.typeBuffer.next(len);

    logr(`int bytes`)((0, _bin.bytesToHex)(bytes), `${field}:int${bits}`);

    return bytes;
  }

  fetchRawBytes(len, field = '') {
    var ln = void 0;
    if (typeof len === 'number') ln = len;else if (typeof len === 'boolean' && len === false) {
      ln = this.readInt(`${field}_length`);
      if (ln > this.typeBuffer.byteView.byteLength) throw new Error(`Invalid raw bytes length: ${ln}, buffer len: ${this.typeBuffer.byteView.byteLength}`);
    } else throw new TypeError(`[fetchRawBytes] len must be number or false, get ${typeof len}`);
    var bytes = this.typeBuffer.next(ln);
    logr(`raw bytes`)((0, _bin.bytesToHex)(bytes), field);

    return bytes;
  }

  fetchPacked(type, field = '') {
    var compressed = (0, _reader.readBytes)(this.typeBuffer, `${field}[packed_string]`);
    var uncompressed = (0, _bin.gzipUncompress)(compressed);
    var buffer = (0, _bin.bytesToArrayBuffer)(uncompressed);
    var newDeserializer = new Deserialization(buffer, {
      mtproto: this.mtproto,
      override: this.override
    }, this.uid);

    return newDeserializer.fetchObject(type, field);
  }

  fetchVector(type, field = '') {
    // const typeProps = getTypeProps(type)
    if (type.charAt(0) === 'V') {
      var _constructor = this.readInt(`${field}[id]`);
      var constructorCmp = (0, _bin.uintToInt)(_constructor);

      if (constructorCmp === PACKED) return this.fetchPacked(type, field);
      if (constructorCmp !== 0x1cb5c415) throw new Error(`Invalid vector constructor ${_constructor}`);
    }
    var len = this.readInt(`${field}[count]`);
    var result = [];
    if (len > 0) {
      var itemType = type.substr(7, type.length - 8); // for "Vector<itemType>"
      for (var i = 0; i < len; i++) {
        result.push(this.fetchObject(itemType, `${field}[${i}]`));
      }
    }

    return result;
  }

  fetchObject(type, field = '') {

    switch (type) {
      case '#':
      case 'int':
        return this.fetchInt(field);
      case 'long':
        return (0, _reader.readLong)(this.typeBuffer, field);
      case 'int128':
        return this.fetchIntBytes(128, field);
      case 'int256':
        return this.fetchIntBytes(256, field);
      case 'int512':
        return this.fetchIntBytes(512, field);
      case 'string':
        return (0, _reader.readString)(this.typeBuffer, field);
      case 'bytes':
        return (0, _reader.readBytes)(this.typeBuffer, field);
      case 'double':
        return (0, _reader.readDouble)(this.typeBuffer, field);
      case 'Bool':
        return this.fetchBool(field);
      case 'true':
        return true;
    }
    var fallback = void 0;
    field = field || type || 'Object';

    // const layer = this.mtproto
    //   ? mtLayer
    //   : apiLayer
    var typeProps = (0, _layout.getTypeProps)(type);
    // layer.typesById

    if (typeProps.isVector) return this.fetchVector(type, field);

    var { apiSchema, mtSchema } = _configProvider2.default.schema.get(this.uid);

    var schema = this.mtproto ? mtSchema : apiSchema;
    var predicate = false;
    var constructorData = false;

    if (typeProps.isBare) constructorData = (0, _typeBuffer.getNakedType)(type, schema);else {
      var _constructor2 = this.readInt(`${field}[id]`);
      var constructorCmp = (0, _bin.uintToInt)(_constructor2);

      if (constructorCmp === PACKED) return this.fetchPacked(type, field);

      var index = schema.constructorsIndex;
      if (!index) {
        schema.constructorsIndex = index = {};
        for (var _i5 = 0; _i5 < schema.constructors.length; _i5++) {
          index[schema.constructors[_i5].id] = _i5;
        }
      }
      var i = index[constructorCmp];
      if (i) constructorData = schema.constructors[i];

      fallback = false;
      if (!constructorData && this.mtproto) {
        var finded = (0, _typeBuffer.getTypeConstruct)(constructorCmp, apiSchema);
        if (finded) {
          constructorData = finded;
          delete this.mtproto;
          fallback = true;
        }
      }
      if (!constructorData) {
        throw new Error(`Constructor not found: ${_constructor2} ${this.fetchInt()} ${this.fetchInt()}`);
      }
    }

    predicate = constructorData.predicate;

    var result = { '_': predicate };

    var isOverrided = predicate === 'rpc_result' || predicate === 'message';

    if (this.mtproto && isOverrided) {
      switch (predicate) {
        case 'rpc_result':
          {
            this.rpc_result(result, `${field}[${predicate}]`);
            break;
          }
        case 'message':
          {
            this.message(result, `${field}[${predicate}]`);
            break;
          }
      }
    } else {
      for (var _iterator5 = constructorData.params, _isArray5 = Array.isArray(_iterator5), _i6 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
        var _ref5;

        if (_isArray5) {
          if (_i6 >= _iterator5.length) break;
          _ref5 = _iterator5[_i6++];
        } else {
          _i6 = _iterator5.next();
          if (_i6.done) break;
          _ref5 = _i6.value;
        }

        var param = _ref5;

        type = param.type;
        // if (type === '#' && isNil(result.pFlags))
        //   result.pFlags = {}
        if (type.indexOf('?') !== -1) {
          var condType = type.split('?');
          var fieldBit = condType[0].split('.');
          var fieldName = fieldBit[0];
          var bit = fieldBit[1];
          if (!(result[fieldName] & 1 << bit)) continue;
          type = condType[1];
        }
        var paramName = param.name;
        var value = this.fetchObject(type, `${field}[${predicate}][${paramName}]`);

        result[paramName] = value;
      }
    }

    if (fallback) this.mtproto = true;
    var { layer: { apiLayer } } = (0, _configProvider.getConfig)(this.uid);
    if (apiLayer.seqSet.has(predicate)) {
      this.emitter.emit('seq', result);
    }

    return result;
  }

  getOffset() {
    return this.typeBuffer.offset;
  }

  fetchEnd() {
    if (!this.typeBuffer.isEnd()) throw new Error('Fetch end with non-empty buffer');
    return true;
  }

  rpc_result(result, field) {
    result.req_msg_id = (0, _reader.readLong)(this.typeBuffer, `${field}[req_msg_id]`);
    if (this.getter == null) return result;
    var sentMessage = this.getter(result);
    var type = sentMessage && sentMessage.resultType || 'Object';

    if (result.req_msg_id && !sentMessage) {
      // console.warn(dTime(), 'Result for unknown message', result)
      return;
    }
    result.result = this.fetchObject(type, `${field}[result]`);
    // console.log(dTime(), 'override rpc_result', sentMessage, type, result)
  }

  message(result, field) {
    result.msg_id = (0, _reader.readLong)(this.typeBuffer, `${field}[msg_id]`);
    result.seqno = (0, _reader.readInt)(this.typeBuffer, `${field}[seqno]`);
    result.bytes = (0, _reader.readInt)(this.typeBuffer, `${field}[bytes]`);

    var offset = this.getOffset();

    try {
      result.body = this.fetchObject('Object', `${field}[body]`);
    } catch (e) {
      console.error((0, _mtprotoShared.dTime)(), 'parse error', e.message, e.stack);
      result.body = { _: 'parse_error', error: e };
    }
    if (this.typeBuffer.offset != offset + result.bytes) {
      // console.warn(dTime(), 'set offset', this.offset, offset, result.bytes)
      // console.log(dTime(), result)
      this.typeBuffer.offset = offset + result.bytes;
    }
    // console.log(dTime(), 'override message', result)
  }

}

exports.Deserialization = Deserialization;
//# sourceMappingURL=index.js.map