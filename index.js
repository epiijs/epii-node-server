'use strict'

const http = require('http')

const me = require('./package.json')
const assist = require('./kernel/assist.js')
const logger = require('./kernel/logger.js')
const server = require('./kernel/server.js')

module.exports = startServer
module.exports.server = server

/**
 * start server
 *
 * @param  {Object} config - config for apps
 * @param  {Object} plugin - { name : handler }
 */
function startServer(config, plugin) {
  logger.info(`epii server version: ${me.version}`)
  var configs = assist.arrayify(config)
  if (configs.length === 0) {
    return logger.warn('server config not provided')
  }

  configs.forEach(function (c) {
    // create server handler
    var handler = server.create(c, plugin)

    // start server
    var httpServer = http
      .createServer(handler)
      .listen(c.port)
      .on('clientError', function (error, socket) {
        // MUST use Node 6+
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
      })

    // output launch info
    logger.done(`start server: ${c.name}`)
    logger.done(` |- port: ${c.port}`)
  })
}
