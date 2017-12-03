'use strict'

const assist = require('./assist')
const logger = require('./logger')
const recipe = require('./recipe')

module.exports = {
  create: createServer
}

/**
 * create server handler
 *
 * @param  {Object} config - app config
 * @param  {Object} plugin - { [name]: [handler] }
 * @return {Function} http.Server callback
 */
function createServer(config, plugin) {
  // verify config
  if (!config) throw new Error('require config')
  if (!config.name) config.name = 'unknown'

  // create koa instance
  var Koa = require('koa')
  var app = new Koa()

  // init epii property
  app.epii = {}

  // attach config
  assist.internal(app.epii, 'config', config, { enumerable: false })

  // apply recipes
  recipe.apply(app)

  // bind event
  app.on('error', function (error) {
    logger.halt('server error', error.message)
    console.error(error.stack)
  })

  // try to compose core with plugin
  var handler = compose(app.callback(), plugin)
  return handler
}

/**
 * compose server with plugins
 *
 * @param  {Server} server
 * @param  {Object} plugins - { name : handler }
 * @return {Function} http.Server callback
 */
function compose(server, plugins) {
  // skip null plugin
  if (!plugins) return server

  var prefix = 'epii'
  var regexp = new RegExp(`^\/_${prefix}_([a-z]+)_\/`)

  return function (request, response) {
    var match = request.url.match(regexp)
    if (match) {
      var plugin = plugins[match[0]]
      if (plugin) {
        request.url = request.url.replace(regexp, '')
        return plugin(request, response)
      }
      logger.warn('nothing for plugin-liked request')
    }
    server(request, response)
  }
}
