(function () {
  function Field() {
    this.window = $('#prg-game-window');
    this.root = $('#prg-game-display');
    this.info = {
      defaultLeft: null,
      screenWidth: null,
      grandWidth: null
    };
    this.travelDistance = app.data.config.travel_distance;
    this.direction = +1;
    this.chimney = [];
    this.enemies = {};
  }

  Field.prototype.build = function () {
    this.initView();
    this.bindAllListeners();
  };

  Field.prototype.initView = function () {
    this.initGauge();
    this.fixedPosition();
    this.displayNinja();
    this.displayHouses();
  };

  Field.prototype.bindAllListeners = function () {
    app.socket.on('enemymove', $.proxy(this.onEnemyMove, this));
    app.socket.on('giftthrown', $.proxy(this.onGiftThrown, this));
    app.socket.on('giftdrop', $.proxy(this.onGiftDrop, this));
    app.socket.on('enemydisconnect', $.proxy(this.onEnemyDisappear, this));
    pubsub.subscribe('supertimer.scene.next', $.proxy(this.move, this));
    pubsub.subscribe('ninja.direction.switch', $.proxy(this.switchDirection, this));
    pubsub.subscribeOnce('game.over', $.proxy(this.onGameOver, this));
  };

  Field.prototype.onGameOver = function () {
    var scoreboad = this.window.find('.scoreboad');
    scoreboad.animate({
      width: '100%',
      height: '100%'
    }, function () {
      var retry = $('<p class="retry"><a href="/">ReTry?</a></p>');
      scoreboad.append(retry);
      retry.fadeIn();
    });
  };

  Field.prototype.initGauge = function () {
    var gauge = new app.widget.Gauge()
      ;

    gauge.build();
  };

  Field.prototype.fixedPosition = function () {
    var screenWidth = this.window.width()
      , grandWidth = this.root.width()
      , grandHeight = this.root.height()
      , left
      ;

    left = (((grandWidth / 2) << 0) - ((screenWidth / 2) << 0));
    this.root.css({
      left: -1 * left + 'px'
    });

    this.info.grandWidth = grandWidth;
    this.info.grandHeight = grandHeight;
    this.info.screenWidth = screenWidth;
    this.info.defaultLeft = left;
    this.left = left;
  };

  Field.prototype.displayNinja = function () {
    var ninja = new app.widget.Ninja(this.info, this.chimney);
    ninja.build();
  };

  Field.prototype.displayHouses = function () {
    var i, iz, house;
    for (i = 0, iz = 30; i < iz; i++) {
      house = new app.widget.House(i);
      house.build();
      this.chimney.push(house.getHitArea());
    }
  };

  Field.prototype.move = function () {
    var left = (this.left + this.travelDistance * this.direction);
    this.root.css({
      left: (-1 * left) + 'px'
    });

    this.left = left;
  };

  Field.prototype.switchDirection = function (context, info) {
    this.direction = info.direction;
  };

  Field.prototype.onEnemyMove = function (data) {
    var uuid = data.id
     , enemy = this.enemies[uuid]
     ;

    if (!enemy) {
      enemy = new app.widget.Enemy(data);
      enemy.build();
      this.enemies[uuid] = enemy;
    }

    enemy.move(data.x, data.y, data.direction);
  };

  Field.prototype.onEnemyDisappear = function (data) {
    var uuid = data.id
     , enemy = this.enemies[uuid]
     ;

    if (enemy) {
      delete this.enemies[uuid];
      enemy.remove();
    }
  };

  Field.prototype.onGiftThrown = function (data) {
    var uuid = data.id
     , enemy = this.enemies[uuid]
     ;

    if (!enemy) {
      return;
    }

    enemy.throwGift(data.x, data.y, data.exists);
  };

  Field.prototype.onGiftDrop = function (data) {
    var uuid = data.id
     , enemy = this.enemies[uuid]
     ;

    if (!enemy) {
      return;
    }

    enemy.throwGift(data.x, data.y, data.exists);
  };

  Namespace.create('app.Field').means(Field);
}());
