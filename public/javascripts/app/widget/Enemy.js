(function () {

  function Enemy(data) {
    this.stage = $('#prg-game-display');
    this.left = data.x;
    this.top = data.y;
    this.uuid = data.id;
    this.direction = 1;
  }

  Enemy.prototype.build = function () {
    this.initView();
  };

  Enemy.prototype.bindAllListeners = function () {

  };

  Enemy.prototype.initView = function () {
    this.create();
    this.clumpGift();
    this.display();
  };

  Enemy.prototype.create = function () {
    var ninja, wrapper, gift;

    ninja = $('<img />').attr({
      src: "/images/ninja.gif"
    }).addClass('ninja');


    wrapper = $('<div></div>').addClass('enemy-wrap').addClass('reflect');
    wrapper.append(ninja);
    wrapper.append(gift);
    this.root = wrapper;
  };

  Enemy.prototype.clumpGift = function () {
    var gift = $('<img />').attr({
      src: "/images/gift.gif"
    }).addClass('gift').attr({id: 'enemy-gift-' + this.uuid});
    this.root.append(gift);
  };

  Enemy.prototype.move = function (x, y, d) {
    if (this.direction !== d) {
      this.switchDirection();
    }
    this.root.css({
      left: x + 'px',
      top: y + 'px'
    });
  };

  Enemy.prototype.switchDirection = function (direction) {
    this.direction = this.direction * -1;
    this.root.toggleClass('reflect');
  };

  Enemy.prototype.display = function () {
    this.stage.append(this.root);
  };

  Enemy.prototype.remove = function () {
    this.root.remove();
  };

  Enemy.prototype.throwGift = function (x, y, exists) {
    var gift = this.stage.find('#enemy-gift-' + this.uuid)
      ;

    this.stage.append(gift);
    gift.css({
      left: x + 'px',
      top: y + 'px'
    });

    pubsub.publish('enemy.gift.threw', null, {
      x: x,
      y: y,
      uuid: this.uuid
    });

    if (!exists) {
      gift.remove();
      this.clumpGift();
    }
  };

  Namespace.create('app.widget.Enemy').means(Enemy);
}());
