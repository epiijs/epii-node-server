import path from 'path';
import Koa from 'koa';

import { Container } from './kernel/inject';
import logger from './kernel/logger';
import layers from './layers';
import { IApp, IServerOptions } from './types';

function checkOptions(options: any): IServerOptions {
  const checkedResult: IServerOptions = {
    name: options.name || 'unknown',
    port: options.port || '8080',
    path: { ...options.path },
    static: {
      prefix: '/__file'
    },
    expert: { ...options.expert },
  };
  if (options?.static?.prefix) {
    checkedResult.static.prefix = '/' + options.static.prefix;
  }
  return checkedResult;
}

/**
 * create server handler
 */
export async function createServer(options: IServerOptions) {
  const checkedOptions = checkOptions(options);

  const app = new Koa() as IApp;
  app.on('error', (error) => {
    logger.error('server error', error.message);
    logger.error(error.stack);
  });

  // init epii runtime
  const container = new Container();
  container.provide('inject', container);
  container.provide('config', checkedOptions);
  container.resolve(path.join(checkedOptions.path.root, checkedOptions.path.server.service));

  // lock epii namespace
  Object.defineProperty(app, 'epii', {
    value: container,
    enumerable: true,
    writable: false,
    configurable: false,
  });

  // init all layers
  await layers.launch(app); // initial basic ability and extend aspect
  await layers.static(app); // perform static output
  await layers.middle(app); // proceed custom middlewares
  await layers.router(app); // proceed custom controllers
  await layers.logger(app); // perform analysis and save logs

  return app.callback();
}
