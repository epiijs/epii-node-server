'use strict'

const path = require('path')
const compose = require('koa-compose')
const logger = require('../kernel/logger')
const loader = require('../kernel/loader')

module.exports = function (app) {
  var config = app.epii.config
  var middleDir = path.join(config.path.root, config.path.server.middleware)

  var order = []
  var middles = {}
  var middleMix = null

  function loadMiddle(file, middle) {
    var name = path.basename(file).slice(0, -3)
    if (name === '$order') {
      if (Array.isArray(middle)) {
        order = middle
      } else {
        logger.halt('invalid middleware order')
      }
    } else {
      middles[name] = middle
    }
    // auto compose after composed
    if (middleMix) {
      middleMix = composeMiddle()
    }
  }

  function composeMiddle() {
    var series = []
    order.forEach(name => {
      var ware = middles[name]
      if (ware) {
        if (Array.isArray(ware)) {
          series = series.concat(ware)
        } else if (typeof ware === 'function') {
          series.push(ware)
        }
      }
    })
    if (series.length === 0) {
      return async function (ctx, next) {
        logger.warn('middleware not found')
        await next()
      }
    }
    return compose(series)
  }

  loader.load(middleDir, loadMiddle)
  loader.watch('middleware', middleDir, loadMiddle)

  middleMix = composeMiddle()
  app.use(async function (ctx, next) {
    await middleMix.call(null, ctx, next)
  })
}
