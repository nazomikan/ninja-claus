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

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);
io.set('log level', 1);


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
    var reduceNum = 1
      , addNum = 1 // add attack parson
      , giftCount = userData[uuidMap[socket.id]].gift - reduceNum
      , attack_socket_id
      ;

    userData[uuidMap[socket.id]].gift -= reduceNum;

    _.each(uuidMap, function (val, key, obj) {
      if (val == data.attack_id) {
        return attack_socket_id = key;
      }
    });

    // if only menage gift number at client side, not required
    /*
     *socket.json.emit('damagereceive', {
     *  giftCount: giftCount
     *});
     */

    io.sockets.socket(attack_socket_id).json.emit('prizereceive', {
      // do something if point get
    });

    // no required
    //socket.broadcast.json.volatile.emit('damagereceive', {
      //gift: giftCount
    //});
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
