var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var FamilySearch = require('fs-js-lite');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.title = 'Pedigree Browser';

// allow the app to be run behind proxies such as nginx or in heroku
app.set('trust proxy', true);

// enable session storage. this defaults to using an in-memory store which is
// only designed for development environments. it will leak memory. use a
// different storage adapter in production such as redis.
app.use(session({
  secret: 'pedigree browser session secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next){
  req.domain = req.protocol + '://' + req.hostname;
  req.fs = new FamilySearch({
    environment: 'integration',
    appKey: 'a02j000000KTRjpAAH',
    redirectUri: req.domain + '/oauth-redirect'
  });
  next();
});

// routes
app.use('/', require('./routes/index'));
app.use('/signin', require('./routes/signin'));
app.use('/oauth-redirect', require('./routes/oauth-redirect'));
app.use('/pedigree', require('./routes/pedigree'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
