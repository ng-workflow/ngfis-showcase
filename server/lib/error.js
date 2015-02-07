/* jshint unused: false */
'use strict';

var errorHandler = require('errorhandler');
var app = require('./../index');

module.exports = function () {
  var logger = app.get('logger') || console;
  if(app.get('env') === 'production'){
    return function (err, req, res, next) {
      var msg = err.stack;
      if (err.mod) msg = '[' + err.mod + '] ' + msg;
      logger.error(msg);

      if (err.status) res.statusCode = err.status;
      if (res.statusCode < 400) res.statusCode = 500;
      res.end();
    }
  }else{
    return errorHandler();
  }
};