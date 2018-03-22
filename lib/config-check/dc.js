'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseServerConfig;

var _newtype = require('../newtype.h');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var defaults = {
  dev: false,
  webogram: false
};

var mainDev = {
  path: 'apiw1',
  protocol: 'http',
  port: 80,
  dcList: [{ id: 1, host: '149.154.175.10' }, { id: 2, host: '149.154.167.40' }, { id: 3, host: '149.154.175.117' }]
};

var mainProd = {
  path: 'apiw1',
  protocol: 'http',
  port: 80,
  dcList: [{ id: 1, host: '149.154.175.50' }, { id: 2, host: '149.154.167.51' }, { id: 3, host: '149.154.175.100' }, { id: 4, host: '149.154.167.91' }, { id: 5, host: '149.154.171.5' }]
};

var webogramProd = {
  path: 'apiw1',
  protocol: 'https',
  port: false,
  dcList: [{ id: 1, host: 'pluto.web.telegram.org' }, { id: 2, host: 'venus.web.telegram.org' }, { id: 3, host: 'aurora.web.telegram.org' }, { id: 4, host: 'vesta.web.telegram.org' }, { id: 5, host: 'flora.web.telegram.org' }]
};

var webogramDev = {
  path: 'apiw_test1',
  protocol: 'https',
  port: false,
  dcList: [{ id: 1, host: 'pluto.web.telegram.org' }, { id: 2, host: 'venus.web.telegram.org' }, { id: 3, host: 'aurora.web.telegram.org' }, { id: 4, host: 'vesta.web.telegram.org' }, { id: 5, host: 'flora.web.telegram.org' }]

  /*
  const webogramProdUpload = {
    path    : 'apiw1',
    protocol: 'https',
    port    : false,
    dcList  : [
      { id: 1, host: 'pluto-1.web.telegram.org' },
      { id: 2, host: 'venus-1.web.telegram.org' },
      { id: 3, host: 'aurora-1.web.telegram.org' },
      { id: 4, host: 'vesta-1.web.telegram.org' },
      { id: 5, host: 'flora-1.web.telegram.org' },
    ]
  }*/

};var getDcConfig = ({ dev = false, webogram = false }) => {
  switch (true) {
    case dev && webogram:
      return webogramDev;
    case dev && !webogram:
      return mainDev;
    case !dev && webogram:
      return webogramProd;
    case !dev && !webogram:
      return mainProd;
    default:
      throw new Error(`Dc configuration error! dev: ${dev.toString()} webogram: ${webogram.toString()}`);
  }
};

function getFlatDcMap(_ref) {
  var { dcList } = _ref,
      opts = _objectWithoutProperties(_ref, ['dcList']);

  var dcMap = new Map();
  var protocol = `${opts.protocol}://`;
  var port = opts.port ? `:${opts.port}` : '';
  var path = `/${opts.path}`;
  for (var _iterator = dcList, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref2 = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref2 = _i.value;
    }

    var { id: _id, host: _host } = _ref2;

    var fullUrl = [protocol, _host, port, path].join('');
    dcMap.set( /*::toDCNumber(*/_id /*::)*/, fullUrl);
  }
  return dcMap;
}

function parseServerConfig(config = {}) {
  var withDefaults = Object.assign({}, defaults, config);
  var cfg = getDcConfig(withDefaults);
  var dcMap = getFlatDcMap(cfg);
  return dcMap;
}
//# sourceMappingURL=dc.js.map