var _ = require('underscore')
  , uuidgen = require('./library/uuid')
  ;

// exports Game constructor
module.exports = Game;

/**
 * ninja-claus game controller
 */
function Game(io) {
  this.io = io;

  // UUID Hash
  // uuidMap[socket.id] => uuid
  this.uuidMap = {};
}

Game.prototype = {
  /**
   * build game
   */
  run: function () {
    this.listenConnection();
  },

  /**
   * observe player connection
   */
  listenConnection: function () {
    this.io.sockets.on('connection', _.bind(this.onConnect, this));
  },

  /**
   * player connection handler
   *
   * @param {socket} socket
   */
  onConnect: function (socket) {
    this.registPlayer(socket);
    this.bindAllListeners(socket);
  },

  /**
   * player regist
   *
   * @param {socket} socket
   */
  registPlayer: function (socket) {
    var uuid;

    // create uuid and save
    this.uuidMap[socket.id + ''] = {};
    uuid = uuidgen();

    // Initalize User
    this.uuidMap[socket.id + ''] = uuid;
  },

  /**
   * observer players event
   *
   * @param {socket} socket
   */
  bindAllListeners: function (socket) {
    socket.on('disconnect', _.bind(this.onDisconnect, this, socket));
    socket.on('gameover', _.bind(this.onGameOver, this, socket));

    socket.on('ninjamove', _.bind(this.onMove, this, socket));
    socket.on('damagereceive', _.bind(this.onDamageReceive, this, socket));

    socket.on('giftthrow', _.bind(this.onGiftThrow, this, socket));
    socket.on('giftdrop', _.bind(this.onGiftDrop, this, socket));
  },

  /**
   * player move handler
   *
   * @param {socket} socket
   * @param {Object} data
   */
  onMove: function (socket, data) {
    var uuidMap = this.uuidMap
      , playerCount = Object.keys(this.uuidMap).length
      ;

    // emit all player (I move!)
    socket.broadcast.json.volatile.emit('enemymove',{
      x: data.x,
      y: data.y,
      direction: data.direction,
      id: uuidMap[socket.id + ''],
      playerCount: playerCount
    });
  },

  /**
   * destroy player info
   * delete session
   * delted uuid
   *
   * @param {socket} socket
   */
  onDisconnect: function (socket) {
    var uuidMap = this.uuidMap
      , uuid = uuidMap[socket.id + '']
      ;

    delete uuidMap[socket.id + ''];
    // emit all player (I leave!);
    socket.broadcast.json.volatile.emit('enemydisconnect',{
      id: uuid
    });
  },

  /**
   * game over handler
   *
   * @param {socket} socket
   */
  onGameOver: function (socket) {
    var uuidMap = this.uuidMap
      , uuid = uuidMap[socket.id + '']
      , playerCount
      ;

    delete uuidMap[socket.id + ''];

    playerCount = Object.keys(uuidMap).length;
    socket.broadcast.json.volatile.emit('enemydisconnect', {
      id: uuid,
      playerCount: playerCount
    });
    socket.disconnect();
  },

  /**
   * damage receive handler
   *
   * @param {socket} socket
   * @param {Object.<string>} attack_id  : id who attacked person
   */
  onDamageReceive: function (socket, data){
    var uuidMap = this.uuidMap
      , attack_socket_id
      ;

    _.each(uuidMap, function (val, key, obj) {
      if (val == data.attack_id) {
        return attack_socket_id = key;
      }
    });

    this.io.sockets.socket(attack_socket_id).json.emit('prizereceive', {});
  },

  /**
   *
   * @param {Object.<string>} id  : target uuid
   * @param {Object.<number>} x : gift down
   * @param {Object.<number>} y : gift down
   */
  onGiftThrow: function (socket, data) {
    var uuidMap = this.uuidMap
      ;

    socket.broadcast.json.volatile.emit('giftthrown', {
      id: uuidMap[socket.id + ''],
      exists: data.exists,
      x: data.x,
      y: data.y
    });
  },

  /**
   * gift drop handler
   *
   * @param {Object.<string>} id  : target uuid
   * @param {Object.<number>} x : gift down
   * @param {Object.<number>} y : gift down
   */
  onGiftDrop: function onGiftDrop(socket, data) {
    var uuidMap = this.uuidMap
      ;

    socket.broadcast.json.volatile.emit('giftdrop', {
      id: uuidMap[socket.id + ''],
      exists: data.exists,
      x: data.x,
      y: data.y
    });
  }
};
