$(document).ready(function () {
  var state = {
    riddle: 0
  };

  // disable contextmenu
  $(document).bind("contextmenu", function () {
    return false;
  });

  // toggle riddle
  $(document).dblclick(function () {
    var container = $('.riddle');
    var scene;
    if (state.riddle > 0) {
      scene = $('.world');
      scene.fadeOut(500, function () {
        scene.remove();
        container.attr('style', 'z-index:-1;');
      });
      state.riddle -= 1;
    } else {
      scene = $('<div class="world"></div>')
        .append($('<div class="epii"></div>')
          .append($('<h1>e<sup><i>πi</i></sup>+1=0</h1>'))
          .append($('<p><i>Leonhard Euler (1707 ~ 1783)</i></p>'))
        );
      container.append(scene.hide());
      container.attr('style', 'z-index:100;');
      scene.fadeIn(500);
      state.riddle = 1;
    }
  });
});
