const http = require('http');
const assist = require('./kernel/assist.js');
const logger = require('./kernel/logger.js');
const server = require('./kernel/server.js');
const packageJSON = require('../package.json');

/**
 * start server
 *
 * @param  {Object} config - config for apps
 * @param  {Object} plugin - { [name]: [handler] }
 * @return {Object[]} http.Server instances
 */
function startServer(config, plugin) {
  const configs = assist.arrayify(config);
  const version = packageJSON.version;
  logger.info(`epii server version: ${version}`);
  if (configs.length === 0) {
    return logger.warn('server config not provided');
  }

  return configs.map(async (c) => {
    // create server handler
    const handler = await server.createServer(c, plugin);

    // start server
    const httpServer = http
      .createServer(handler)
      .listen(c.port)
      .on('clientError', (error, socket) => {
        // MUST use Node 6+
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      });

    // output launch info
    logger.done(`start server: ${c.name}`);
    logger.done(` |- port: ${c.port}`);

    return httpServer;
  });
}

module.exports = startServer;