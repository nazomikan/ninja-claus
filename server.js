/**
 * Module dependencies.
 */
var http = require('http')
  , path = require('path')
  ;

var _ = require('underscore')
  , express = require('express')
  , socketio = require('socket.io')
  , favicon = require('static-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  ;

var middleware = require('./library/middleware')
  , Game = require('./game')
  , app = express()
  , port = 8000
  , server
  , io
  , game
  ;

// configuration
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// set middleware
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);
/// catch 404 and forwarding to error handler
app.use(middleware.notfound);

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(middleware.debugger);
}

// production error handler
// no stacktraces leaked to user
app.use(middleware.error);

// Routes
app.get('/', function(req, res){
  res.render('index');
});

// server listen
server = http.createServer(app).listen(app.get('port'), function(err){
  if (err) { console.error(err); process.exit(-1); }
  console.log("Express server listening on port " + app.get('port'));
});

// game build
io = socketio.listen(server, {'log level': 1});
game = new Game(io);
game.run();

// exports application
module.exports = app;
