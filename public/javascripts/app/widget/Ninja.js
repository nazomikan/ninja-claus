(function () {
  function Ninja(stageInfo, chimney) {
    this.stage = $('#prg-game-display');
    this.wrapper = null;
    this.root = null;
    this.stageInfo = stageInfo;
    this.chimney = chimney;
    this.baseWidth = 170;
    this.baseHeight = 125;
    this.direction = +1;
    this.travelDistance = app.data.config.travel_distance;
    this.left = null;
    this.top = 10;
    this.gift = null;
    this.life = app.data.config.max_throw_count;
  }

  Ninja.prototype.build = function () {
    this.initView();
    this.bindAllListeners();
  };

  Ninja.prototype.initView = function () {
    this.create();
    this.clumpGift();
    this.fixPosition();
    this.display();
  };

  Ninja.prototype.bindAllListeners = function () {
    pubsub.subscribe('supertimer.scene.next', $.proxy(this.move, this));
    pubsub.subscribe('gauge.fired', $.proxy(this.throw, this));
    pubsub.subscribe('enemy.gift.threw', $.proxy(this.takeAttack, this));
    pubsub.subscribeOnce('game.over', $.proxy(this.cleanUp, this));
    $('html').keydown($.proxy(this.handleKeyBoad, this));
  };

  Ninja.prototype.cleanUp = function () {
    pubsub.unsubscribe('supertimer.scene.next');
    pubsub.unsubscribe('gauge.fired');
    pubsub.unsubscribe('enemy.gift.threw');
    $('html').off('keydown');
  };

  Ninja.prototype.create = function () {
    var ninja, wrapper, gift;

    ninja = $('<img />').attr({
      src: "/images/ninja.gif"
    }).addClass('ninja');


    wrapper = $('<div></div>').addClass('ninja-wrap').addClass('reflect');
    wrapper.append(ninja);
    wrapper.append(gift);
    this.root = wrapper;
  };

  Ninja.prototype.clumpGift = function () {
    var gift
      , lifeBoad
      ;

    life = $('#life');
    life.text(this.life);
    this.life -= 1;
    if (this.life < 0) {
      app.socket.emit('gameover');
      pubsub.publish('game.over');
    } else {
      gift = $('<img />').attr({
        src: "/images/gift.gif"
      }).addClass('gift').attr({id: 'ninja-gift'});

      this.root.append(gift);
    }
  };

  Ninja.prototype.handleKeyBoad = function (evt) {
    switch(evt.which){
    case 39: // Key[→]
      if (this.direction != +1) {
        this.switchDirection();
      }
      break;
    case 37: // Key[←]
      if (this.direction != -1) {
        this.switchDirection();
      }
      break;
    case 38: // Key[↑]
      evt.preventDefault();
      this.up();
      break;

    case 40: // Key[↓]
      evt.preventDefault();
      this.down();
      break;
    }
  };

  Ninja.prototype.switchDirection = function (direction) {
    this.direction = this.direction * -1;
    this.root.toggleClass('reflect');
    pubsub.publish('ninja.direction.switch', null, {
      direction: this.direction,
      travelDistance: this.travelDistance
    });
  };

  Ninja.prototype.move = function () {
    var left
      , currentLeft
      ;

    currentLeft = this.left;
    left = (this.left + this.travelDistance * this.direction);
    if (left + this.baseWidth >= this.stageInfo.grandWidth || left <= 0) {
      this.switchDirection();
      left = (currentLeft + this.travelDistance * this.direction);
    }

    this.root.css({
      left: left + 'px'
    });

    this.left = left;
    app.socket.emit('ninjamove', {x: this.left, y: this.top, direction: this.direction});
  };

  Ninja.prototype.up = function (evt) {
    var top = this.top - 10;
    if (top <= 0) {
      top = 0;
    }

    this.root.css({
      top: top + 'px'
    });

    this.top = top;
  };

  Ninja.prototype.down = function () {
    var top = this.top + 10;
    if (top >= 150) {
      top = 150;
    }

    this.root.css({
      top: top + 'px'
    });

    this.top = top;
  };

  Ninja.prototype.throw = function (context, per) {
    var that = this
      , gift = this.root.find('#ninja-gift')
      , left = this.left + (this.direction > 0 ? 20 : this.baseWidth - 20)
      , top = this.top + -5
      , grandHeight = this.stageInfo.grandHeight
      , x = 0
      , y = 0
      , r = 20
      ;

    this.stage.append(gift);
    gift.css({
      left: left + 'px',
      top: top + 'px'
    });

    (function lazyLoop(gv) {
      pubsub.subscribeOnce('supertimer.scene.next', function () {
        var isHit = false
          , correctX
          , correctY
          , center
          , posX
          , posY
          , score
          ;

        x += per / 2;
        y += 5 + gv;
        posX = left + (x * that.direction);
        posY = top + y;
        gift.css({
          left: posX + 'px',
          top: posY + 'px'
        });
        center = posX + r;

        $.each(that.chimney, function (idx, line) {
          if (posY <= line.h + 8 && posY + r >= line.h - 8 ) {
            if (line.s - 8 <= center && line.e + 8 >= center) {
              isHit = true;
              correctX = line.s;
              correctY = line.h;
              that.thx(correctX, correctY);
            }
          }
        });

        if (isHit || posY > grandHeight) {
          if (isHit) {
            score = $('#score');
           score.text(+score.text() + (per / 10));
          }
          gift.remove();
          that.clumpGift();
          app.socket.emit('giftthrow', {x: posX, y: posY, exists: 0});
          context.publish('gift.throw');
        } else {
          app.socket.emit('giftthrow', {x: posX, y: posY, exists: 1});
          lazyLoop((gv + 2.5));
        }
      });
    }(0));
  };

  Ninja.prototype.thx = function (correctX, correctY) {
    var thx = $('<div></div>').addClass('thx')
      , inner = $('<div></div>').addClass('in')
      ;

    inner.text('thank you!!');
    thx.append(inner);
    thx.css({
      left: (correctX - 15) + 'px',
      top: (correctY - 100) + 'px'
    });
    this.stage.append(thx);
    setTimeout(function () {
      thx.remove();
    }, 1000);
  };

  Ninja.prototype.fixPosition = function () {
    var stageInfo = this.stageInfo
      , left = stageInfo.defaultLeft + (stageInfo.screenWidth / 2) - (this.baseWidth / 2)
      ;

    this.root.css({
      left: left + 'px'
    });

    this.left = left;
  };

  Ninja.prototype.display = function () {
    this.stage.append(this.root);
  };

  Ninja.prototype.takeAttack = function (context, enemyData) {
    var that = this
      , gift = this.root.find('#ninja-gift')
      , grandHeight = this.stageInfo.grandHeight
      , isHit = false
      , position
      , topS
      , topE
      , leftS
      , leftE
      , cx
      , cy
      ;

    if (!gift.length) {
      return;
    }

    cy = enemyData.y + 20;
    cx = enemyData.x + 20;
    position = this.root.position();
    leftS = position.left + (this.direction > 0 ? 0 : this.baseWidth / 2);
    leftE = leftS + (this.baseWidth / 2 );
    topS = position.top;
    topE = topS + (this.baseHeight / 2);
    if (leftS <= cx && cx <= leftE) {
      if (topE >= cy  && cy >= topS) {
        isHit = true;
      }
    }

    if (isHit) {
      this.stage.append(gift);
      (function lazyLoop(top) {
        top = top || topS;
        gift.css({
          left: leftS + 'px',
          top: top + 'px'
        });

        if (top > grandHeight) {
          app.socket.emit('giftdrop', {x: leftS, y: top, exists: 0});
          that.clumpGift();
        } else {
          app.socket.emit('giftdrop', {x: leftS, y: top, exists: 1});
          pubsub.subscribeOnce('supertimer.scene.next', function () {
            lazyLoop(top + 10);
          });
        }
      }());
    }

  };

  Namespace.create('app.widget.Ninja').means(Ninja);
}());
