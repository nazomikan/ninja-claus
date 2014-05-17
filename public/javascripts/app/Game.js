(function () {

  function Game() {

  }

  Game.prototype.build = function () {
    var field = new app.Field()
      , timer = new app.SuperTimer()
      , audio = new Audio('/audio/sound.ogg')
      ;

    timer.build();
    field.build();
    audio.loop = true;
    audio.play();

    pubsub.subscribeOnce('game.over', function () {
      audio.volume = 0.1;
    });
  };

  Namespace.create('app.Game').means(Game);
}());
