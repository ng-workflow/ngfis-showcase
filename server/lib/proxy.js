'use strict';

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxy();

module.exports = function (options) {
  if (typeof options === 'string'){
    options = {
      target: options
    };
  }

  return function (req, res, next) {
    req.headers['host'] = "assistant.9game.cn";
    proxy.web(req, res, options, function (err) {
      err.mod = 'proxy';
      next(err);
    });
  };
};