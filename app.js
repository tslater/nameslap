
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path');


var passport = require('passport'),
 LocalStrategy = require('passport-local').Strategy,
 GoogleStrategy = require('passport-google').Strategy;


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

//sessions
app.use(express.cookieParser());
app.use(express.session({secret: 'slap4my5name'}));

app.use(passport.initialize());
app.use(passport.session());


app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

var appDomain = "nameslap.com";
// development only
if ('development' == app.get('env')) {
  appDomain = "localhost:3000";
  app.use(express.errorHandler());
}

function removeSubdomain(hostname){
  var hostnameArr = hostname.split('.');
  hostnameArr.shift();
  return hostnameArr.join('.');
}


require("./User.js");
User = new User();

require("./DomainSearcher.js");
domainSearcher = new DomainSearcher();
domainSearcher.testConnection();

app.get('/*', function(req, res, next) {
    if (req.headers.host.match(/^www/) !== null )
      res.redirect('http://' + removeSubdomain(req.headers.host) + req.url, 301);
    else next();
});



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
    returnURL: 'http://'+appDomain+'/auth/google/return',
    realm: 'http://'+appDomain+'/'
  },
  function(identifier, profile, done) {
    User.findOrCreate({ openId: identifier, userInfo: profile, provider: "google" }, function(err, user) {
      done(err, user);
    });
  }
));
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/return',
  passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/login' }));



app.get('/', function(req, res){
      res.render('random_gen',{});
});

app.post('/randomGen', function(req, res){
  var suggestion = req.body.suggestion;
  var callbackFunc = function(results){
    res.send(JSON.stringify(results));
  };
  if(suggestion === undefined)
    domainSearcher.generateAndTestWords(callbackFunc);
  else
    domainSearcher.generateAndTestWords(callbackFunc, suggestion);
});

app.get('/listWords:limit?', function(req, res){
  var limit = req.params.limit;
    if (!limit)
      limit = 100;
    domainSearcher.allWords(limit, function(rows){
      res.render('all_words',{
        words: rows
      });
    });
});

app.get('/login', function(req, res){
  res.render('login');
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
