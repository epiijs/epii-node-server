import * as http from 'http';

import logger from './logger';
import { createServer } from './server';
import { IServerConfig } from './types';

export async function startServer(config: IServerConfig) {
  const handler = await createServer(config);
  const httpServer = http
    .createServer(handler)
    .listen(config.port);

  logger.ready(`start server = ${config.name}`);
  logger.ready(` |- port = ${config.port}`);

  return httpServer;
}

export type {
  IServerConfig
}