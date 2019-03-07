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
async function applyRecipe(app) {
  var order = []
  var recipes = {}

  await loader.load(
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

  for (let i = 0; i < order.length; i ++) {
    await recipes[order[i]](app)
  }
  return recipes
}
