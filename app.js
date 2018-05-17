
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

var config = require('./config.json');

var app = express();

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new StravaStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: "/auth/strava/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
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
app.use("/modules", express.static(path.join(__dirname, 'node_modules')));

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
    
    getStats(req, function(error, user, stats, activities) {

      if (!error) {

        var summary = {
          ride : stats.ytd_ride_totals.count,

        };

        res.render('stats', { user: user, stats:stats, activities: activities});
      }

    });

});

app.get('/update', ensureAuthenticated, 
  function(req, res) {
    getStats(req, function(error, user, stats, activities) {

    if (!error) {
      res.render('stats', { user: user, stats:stats, activities: activities});
    }

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

function getStats(req, callback) {
  var user = req.user;

  strava.athletes.stats({id:user.id, access_token:user.token},
    function(err, payload, limits) {

    var stats = payload;
    console.log(JSON.stringify(user));
    console.log("----");
    console.log(JSON.stringify(payload));
 
    strava.athlete.listActivities({id:user.id, access_token:user.token},
      function(err, payload, limits) {
        console.log("----");
 
        console.log(JSON.stringify(payload));

        callback(null, user, stats, payload);

      });

  });

}
