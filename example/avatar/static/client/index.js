$(document).ready(function () {
  // disable contextmenu
  $(document).bind("contextmenu", function () {
    return false
  })

  // toggle world
  var world_on = false
  $(document).dblclick(function () {
    var world
    var riddle = $('.riddle')
    if (world_on) {
      world = $('.world')
      world.fadeOut(500, function () {
        world.remove()
        riddle.attr('style', 'z-index:-1;')
      })
    } else {
      var euler =
      world = $('<div class="world"></div>').append(
        $('<div class="epii"></div>').append(
          // add Euler's identity
          $('<h1>e<sup><i>πi</i></sup>+1=0</h1>')
        ).append(
          // add Leonhard Euler
          $('<p><i>Leonhard Euler (1707 ~ 1783)</i></p>')
        )
      )
      riddle.append(world.hide())
      riddle.attr('style', 'z-index:100;')
      world.fadeIn(500)
    }
    world_on = !world_on
  })
})
