$(document).ready(function () {

  var socket = io.connect();

  Namespace.create('app.socket').means(socket);
  var game = new app.Game()
    , intoro = $('#introduction')
    ;

  intoro.find('.proceed').on('click', function (evt) {
    evt.preventDefault();
    setTimeout(function () {
      intoro.remove();
      game.build();
    }, 100);
  });
});
