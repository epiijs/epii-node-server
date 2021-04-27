const http = require('http');
const logger = require('./kernel/logger.js');
const { createServer } = require('./server.js');
const packageJSON = require('../package.json');

/**
 * start server
 *
 * @param  {Object} config - config for app
 * @return {Object} http.Server instance
 */
async function startServer(config) {
  const version = packageJSON.version;
  logger.info(`epii server version ${version}`);

  const handler = await createServer(config);
  const httpServer = http
    .createServer(handler)
    .listen(config.port)
    .on('clientError', (error, socket) => {
      if (error.code === 'ECONNRESET' || !socket.writable) return;
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

  logger.done(`start server = ${config.name}`);
  logger.done(` |- port = ${config.port}`);
  return httpServer;
}

module.exports = {
  startServer,
};
