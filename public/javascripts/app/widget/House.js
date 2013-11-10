(function () {
  function House(no) {
    this.stage = $('#prg-game-display');
    this.root = null;
    this.no = +no;
    this.margin = 200;
    this.baseWidth = 239;
    this.baseHeight = 228;
  }

  House.prototype.build = function () {
    this.initView();
    this.bindAllListeners();
  };

  House.prototype.initView = function () {
    this.create();
    this.fixPosition();
    this.fixHeight();
    this.display();
  };

  House.prototype.bindAllListeners = function () {

  };

  House.prototype.create = function () {
    return this.root = $('<img>').attr({
      src: "/images/home.gif"
    }).addClass('home');
  };

  House.prototype.fixPosition = function () {
    var margin = +this.margin
      , no = +this.no
      ;

    this.root.css({
      left: (no * margin) + 'px',
      bottom: 0,
      zIndex: (100 + no)
    });
  };

  House.prototype.getHitArea = function () {
    var offset = this.root.position()
      , scale = app.data.house_position[this.no]
      , pos
      ;

    //W 165-190  = 25
    //H 15
    pos = {
      s: (offset.left + 155),
      e: (offset.left + 195),
      h: (offset.top + (15 * scale))
    };

    return pos;
  };

  House.prototype.fixHeight = function () {
    var scale = app.data.house_position[this.no]
      , size = this.baseHeight * scale
      ;

    this.root.css({
      widrh: this.baseWidth + 'px',
      height: (size) + 'px'
    });
  };

  House.prototype.display = function () {
    this.stage.append(this.root);
  };

  Namespace.create('app.widget.House').means(House);
}());
