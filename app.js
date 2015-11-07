var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var fs = require('fs');
var connection = require('./db.js');

var facebook = require('./facebook.js');
var passport = require('passport');
var session = require('express-session');
var FacebookStrategy = require('passport-facebook').Strategy;

var connection = require('./db.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(ejsLayouts);
//needed for facebook login
app.use(session({
  secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use('facebook', new FacebookStrategy({

    clientID        : facebook.fbConfig.appID,
    clientSecret    : facebook.fbConfig.appSecret,
    callbackURL     : facebook.fbConfig.callbackUrl,
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture', 'emails']
  },

  // facebook will send back the tokens and profile
  function(access_token, refresh_token, profile, done) {
      //check if the user exists
        console.log(profile);
        connection.connect();
        var query = "INSERT INTO users(id, name, picture, token) VALUES('" + profile.id + "', '" + profile.displayName + "', '"+ profile.photos[0].value + "', '" + access_token + "');";
        console.log(query);
        connection.query(query, function(err, rows, fields) {
          if(err)
            console.log(err);
          else  console.log('inserted');
        });
      return done(null, profile);
  })
);

app.get('/auth/facebook', passport.authenticate('facebook', {authType: 'reauthenticate'}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/', successRedirect: '/home' }));


app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

//automaticly import controller files
fs.readdirSync(__dirname + '/controllers').filter(function(file) {
  return(file.indexOf('.') !== 0);
}).forEach(function(file) {
  var name = file.substring(0, file.length - 3);
  var controller = require('./controllers/' + name);

  //set index route
  if(name === 'index')
    app.use('/', controller);
  else app.use('/' + name, controller);
});

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
