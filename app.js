
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var pug = require('pug');
var passport = require('passport');
var strava = require('strava-v3');

var StravaStrategy = require('passport-strava-oauth2').Strategy;

var app = express();

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new StravaStrategy({
    clientID: "22263",
    clientSecret: "f3e6e881b8cc3132349d3bb9033be049a7e60fcc",
    callbackURL: "/auth/strava/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      console.log("im here a");
      return done(null, profile);
    });
  }
));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function logMessage(message) {
  
  console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + '[INFO] ' + message);
  
}

function logError(message) {
  
  console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' [ERROR] ' + message);
  
}
  
app.get('/', routes.index);

app.get('/auth/strava',
  passport.authenticate('strava', { scope: ['public'] }),
  function(req, res) {
  });

app.get('/auth/strava/callback', 
  passport.authenticate('strava', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/stats');
  });

app.get('/stats', ensureAuthenticated, 
    function(req, res) {

      var user = req.user;
 
      strava.athletes.stats({id:user.id, access_token:user.token},
        function(err, payload, limits) {

        console.log(JSON.stringify(payload));

        var stats = payload;
        var athletes = [];

        strava.athletes.listFollowers({id:user.id, access_token:user.token},
          function(err, payload, limits) {
  
          console.log(JSON.stringify(payload));
  
          payload.forEach(function(item, index, array) {
            athletes.push(item);
            
          });
  
          res.render('stats', { user: user, stats:stats, athletes: athletes});
  
        });
  

      });

});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port: \'' + app.get('port') +'\'');
});

function ensureAuthenticated(req, res, next) {
  
  if (req.isAuthenticated()) { 
      return next(); 
  }

  res.redirect('/')

}
