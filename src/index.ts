import http from 'http';

import logger from './kernel/logger';
import { createServer } from './server';
import { IServerOptions } from './types';

export async function startServer(options: IServerOptions) {
  const packageJSON = require('../package.json');

  const version = packageJSON.version;
  logger.info(`epii server version ${version}`);

  const handler = await createServer(options);
  const httpServer = http
    .createServer(handler)
    .listen(options.port);

  logger.ready(`start server = ${options.name}`);
  logger.ready(` |- port = ${options.port}`);

  return httpServer;
}
