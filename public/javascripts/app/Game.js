(function () {

  function Game() {

  }

  Game.prototype.build = function () {
    var field = new app.Field()
      , timer = new app.SuperTimer()
      , audio = new Audio('/audio/sound.mp3')
      ;

    timer.build();
    field.build();
    audio.loop = true;
    audio.play();
  };

  Namespace.create('app.Game').means(Game);
}());
