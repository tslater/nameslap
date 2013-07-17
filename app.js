
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function removeSubdomain(hostname){
  var hostnameArr = hostname.split('.');
  hostnameArr.shift();
  return hostnameArr.join('.');
}

require("./DomainSearcher.js");
domainSearcher = new DomainSearcher();
domainSearcher.testConnection();

app.get('/*', function(req, res, next) {
    if (req.headers.host.match(/^www/) !== null )
      res.redirect('http://' + removeSubdomain(req.headers.host) + req.url, 301);
    else next();
});


app.get('/', function(req, res){
      res.render('random_gen',{});
});

app.post('/randomGen', function(req, res){
  domainSearcher.generateAndTestWords(function(results){
    res.send(JSON.stringify(results));
  });
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


app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
