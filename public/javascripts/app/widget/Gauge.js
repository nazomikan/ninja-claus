(function () {
  function Gauge() {
    this.root = $('#prg-power-gauge');
    this.isProgress = false;
    this.percent = 0;
  }

  Gauge.prototype.build = function () {
    this.bindAllListeners();
  };

  Gauge.prototype.bindAllListeners = function () {
    $('html').keydown($.proxy(this.handleKeyBoad, this));
    pubsub.subscribeOnce('game.over', $.proxy(this.cleanUp, this));
  };

  Gauge.prototype.clearnUp = function () {
    $('html').off('keydown');
  };

  Gauge.prototype.handleKeyBoad = function (evt) {
    switch(evt.which){
    case 32: // Key[space]
      evt.preventDefault();
      if (this.isProgress) {
        this.isStop = true;
      } else {
        this.fire();
      }
      break;
    }
  };

  Gauge.prototype.fire = function () {
    var that = this
      ;

    this.root.css({width: this.percent + '%'});
    this.isProgress = true;
    pubsub.subscribeOnce('supertimer.scene.next', function () {
      var context
        ;

      if (that.isStop) {
        context = Pubsub.create();
        context.subscribe('gift.throw', function () {
          that.isStop = false;
          that.isProgress = false;
          that.percent = 0;
          that.root.css({width: '0%'});
        });
        pubsub.publish('gauge.fired', context, that.percent);
        return;
      }

      if (that.percent >= 100) {
        that.root.css({width: '0%'});
        that.isProgress = false;
        that.percent = 0;
        return;
      }

      that.percent += 5;
      that.fire();
    });
  };


  Namespace.create('app.widget.Gauge').means(Gauge);
}());
