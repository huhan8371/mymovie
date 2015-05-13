var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var multer = require('multer');

var routes = require('./routes/index');
var app = express();

var mongoose = require('mongoose');
var dburl = 'mongodb://localhost/movie';
mongoose.connect(dburl);
var db = mongoose.connection;
db.on('error', function(err){
  console.error('connect to %s error: ', dburl, err.message);
  process.exit(1);
});

db.once('open', function () {
  console.log('%s has been connected.', dburl);
});

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(multer()); // for parsing multipart/form-data
app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
 
app.use(session({
    secret: 'mobd',
    resave:false,
    saveUninitialized:false,
    cookie: { maxAge: 6000 },
    store: new MongoStore({
        db:'movie'
    })
}));

/*
app.use(function(req, res, next) {
  var sess = req.session
  console.log(sess);
  if (sess.views) {
    sess.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + sess.views + '</p>')
    res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    sess.views = 1
    res.end('welcome to the session demo. refresh!')
  }
})
*/
  // pre handle user
  app.use(function(req, res, next) {
    var sess = req.session

    console.log(sess.user);
     if (sess.views) {
        sess.views++
        sess.expiresin = (sess.cookie.maxAge / 1000)
        console.log(sess.expiresin);
      } else {
        sess.views = 1
      }

    if(sess.user){
         app.locals.user = sess.user
    } 
    else{
        console.log("user is expried");
        app.locals.user = null;
    }

    console.log( sess.views)
    next();
  });

app.use('/', routes);

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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
