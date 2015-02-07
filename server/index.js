'use strict';

var meta = require('../package.json');
var express = require('express');
var fs = require('fs');
var compress = require('compression');
var morgan = require('morgan');
var path = require('path');
var app = module.exports = express();
var middleware = ['combo', 'router', 'proxy', 'static', 'error', 'inject'];

// lazy load middlewares
middleware.forEach(function (m) {
  middleware.__defineGetter__(m, function () {
    return require('./lib/' + m);
  });
});

process.on('uncaughtException', function (err) {
  (app.get('logger') || console).error('Uncaught exception:\n', err.stack);
});

app.set('name', meta.name);
app.set('version', meta.version);
app.set('port', process.env.PORT || 5000);
app.set('root', path.resolve(__dirname, '../').replace(/\/+$/, ''));
app.set('logger', console);
app.enable('trust proxy');

//日志
app.use(morgan('tiny', {
  skip: function (req, res){
    var delay = morgan['response-time'](req, res);
    return res.statusCode < 400 && delay < 300;
  },
  stream: app.get('env') === 'development' ? null : fs.createWriteStream(path.join(__dirname, '../private/log/access.log'), {flags: 'a'})
}));

app.use(compress());

//console.log('UAE_MODE:', process.env.UAE_MODE);
//console.log('ENV:', app.get('env'), process.env.NODE_ENV);
//console.log('PORT:', process.env.PORT);

if(app.get('env') === 'development') {
  app.use(middleware.inject());
}

//combo组合接口
app.use('/co', middleware.combo('/public'));

//默认首页
app.use(middleware.router({index: '/' + meta.name + '/' + meta.version + '/index.html'}));

// app.use('/api/*', middleware.proxy('http://cors-api-host'));

//静态文件
app.use('/latest', middleware.static('/public/' + meta.name + '/' + meta.version));
app.use(middleware.static());

//错误处理
app.use(middleware.error());

if(require.main === module){
  app.listen(app.get('port'), function(){
    console.log('[%s] Express server listening on port %d', app.get('env').toUpperCase(), app.get('port'));
  });
}