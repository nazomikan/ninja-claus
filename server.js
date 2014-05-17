/**
 * Module dependencies.
 */
require('nko')('0UmCzdA1IpmjkOyn');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var app = express();
var isProduction = app.get('env') === 'production';
var port = isProduction ? 80: 8000;


// Configuration
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routes
app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(err){
  if (err) { console.error(err); process.exit(-1); }

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err); }
      process.setuid(stats.uid);
    });
  }
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server, {
  'log level': 1
});


// UUID Hash
// uuidMap[socket.id] => uuid
// userData[uuid] => {gift : }
var uuidMap = {}
  , userData = {}
  ;

io.sockets.on('connection', function(socket) {
  var user, uuid;

  // create uuid and save
  uuidMap[socket.id + ''] = {};
  // likely RFC 4122
  uuid = (function(){
    // create random string
    var crs = function() {
      return (((1 + Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (crs() + crs() + "-" + crs() + "-" + crs() + "-" + crs() + "-" + crs() + crs() + crs());
  })();

  // Initalize User
  uuidMap[socket.id + ''] = uuid;
  userData[uuid] = {
    gift: 20,
    score: 0
  }

  socket.on('ninjamove', function(data) {
    socket.broadcast.json.volatile.emit('enemymove',{
      x: data.x,
      y: data.y,
      direction: data.direction,
      id: uuidMap[socket.id + '']
    });
  });

  // delete session
  // delted uuid
  socket.on('disconnect', function() {
    var uuid = uuidMap[socket.id + '']
    uuidMap[socket.id + ''] = null;
    delete uuidMap[socket.id + ''];
    socket.broadcast.json.volatile.emit('enemydisconnect',{
      id: uuid
    });
  });

  // gameover
  socket.on('gameover', function(){
    var uuid = uuidMap[socket.id + '']
    uuidMap[socket.id + ''] = null;
    delete uuidMap[socket.id + ''];
    socket.broadcast.json.volatile.emit('enemydisconnect',{
      id: uuid
    });
    socket.disconnect();
  });

  // @param {Object.<string>} attack_id  : id who attacked person
  socket.on('damagereceive', function(data){
    var attack_socket_id
      ;

    _.each(uuidMap, function (val, key, obj) {
      if (val == data.attack_id) {
        return attack_socket_id = key;
      }
    });

    io.sockets.socket(attack_socket_id).json.emit('prizereceive', {});
  });

  // @param {Object.<string>} id  : target uuid
  // @param {Object.<number>} x : gift down
  // @param {Object.<number>} y : gift down
  socket.on('giftthrow', function (data) {
    socket.broadcast.json.volatile.emit('giftthrown', {
      id: uuidMap[socket.id + ''],
      exists: data.exists,
      x: data.x,
      y: data.y
    });
  });

  // @param {Object.<string>} id  : target uuid
  // @param {Object.<number>} x : gift down
  // @param {Object.<number>} y : gift down
  socket.on('giftdrop', function (data) {
    socket.broadcast.json.volatile.emit('giftdrop', {
      id: uuidMap[socket.id + ''],
      exists: data.exists,
      x: data.x,
      y: data.y
    });
  });
});
