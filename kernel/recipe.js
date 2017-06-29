'use strict'

const path = require('path')
const loader = require('./loader.js')

module.exports = {
  apply: applyRecipe
}

/**
 * load & use recipes
 *
 * @param {Object} app
 * @return {Object} recipes
 */
function applyRecipe(app) {
  var order = []
  var recipes = {}

  loader.load(
    path.join(__dirname, '../recipe'),
    function (file, recipe) {
      var name = path.basename(file.slice(0, -3))
      if (name === '$order') {
        order = recipe
      } else {
        recipes[name] = recipe
      }
    }
  )

  order.forEach(name => recipes[name](app))
  return recipes
}
