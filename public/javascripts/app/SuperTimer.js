(function () {

  function SuperTimer() {
    this.fps = 20;
    this.duration = 1000 / this.fps << 0;
    this.timerId;
  }

  SuperTimer.prototype.build = function () {
    this.bindAllListeners();
  };

  SuperTimer.prototype.bindAllListeners = function () {
    this.timerId = setInterval($.proxy(this.publisher, this), this.duration);
    pubsub.subscribeOnce('game.over', $.proxy(this.cleanUp, this));
  };

  SuperTimer.prototype.cleanUp = function () {
    clearInterval(this.timerId);
  };

  SuperTimer.prototype.publisher = function () {
    pubsub.publish('supertimer.scene.next');
  };

  Namespace.create('app.SuperTimer').means(SuperTimer);
}());
