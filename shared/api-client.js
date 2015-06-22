var superagent = require('superagent');

var Promise = require('bluebird');

var DEFAULT_BASE_URI = '/api';

var DASHBOARDS_URI = 'dashboards';

function toError (json) {
  var error = json.error || {};
  var message = error.message || json.message;
  return new Error(message);
}

var ApiClient = function (attr) {
  attr = attr || {};

  this.base_uri = attr.base_uri || DEFAULT_BASE_URI;

  // pending request
  this.request = null;
};

ApiClient.prototype.abort = function () {
  if (!this.request) {
    return;
  }
  this.request.abort();
};

ApiClient.prototype.list_dashboards = function () {
  var uri = [this.base_uri, DASHBOARDS_URI].join('/');

  return this._req({
    uri: uri,
    method: 'GET'
  }).then(function (res) {
    var json = res.body;
    if (res.status === 200) {
      return json;
    }
    throw toError(json);
  });
};

ApiClient.prototype._req = function (opts) {
  var _this = this;

  var method = opts.method;
  var uri = opts.uri;
  var body = opts.body;
  var headers = opts.headers || {};

  return new Promise(function (resolve, reject) {
    _this.request = superagent(method, uri)
      .timeout(60 * 1000)
      .accept('json')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set(headers)
      .send(body)
      .end(function (err, res) {
        _this.request = null;

        if (err) {
          return reject(err);
        }
        resolve(res);
      });
  });
};

module.exports = ApiClient;