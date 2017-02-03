var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Initiate MongoDB before Routes
var mongoose = require('mongoose');

// Get Passport for Authentication
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Use Config for shared variables
var config = require('./config');

// Connect the Mongo DB
var mongoUrl = "mongodb://root:W9FQJcZn@104.197.209.189:27017/transM";

mongoose.connect(mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected correctly Database to server");
});

var app = express();

var users = require('./routes/users');
var transformerRouter = require('./routes/transformerRouter');
var routes = require('./routes/index');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Log the incoming Message
app.use(logger('dev'));

// Parse the incoming Message
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Passport config
var user = require('./models/users');
app.use(passport.initialize());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


// Static Content Routes
app.use(express.static(path.join(__dirname, 'public')));

// Dynamic Content Routes
app.use('/', routes);
app.use('/users', users);
app.use('/transformer',transformerRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;