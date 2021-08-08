import path from 'path';
import Koa from 'koa';

import Container from './kernel/inject';
import logger from './kernel/logger';
import layers from './layers';
import { IApp, IConfig } from './kernel/define';

/**
 * normalize config
 */
function verifyConfig(c: any): IConfig {
  const config: IConfig = {
    name: c.name || 'unknown',
    path: { ...c.path },
    static: c.static ? {
      prefix: c.static.prefix || (c.prefix && c.prefix.static) || '/__file',
    } : {
      prefix: '/__file',
    },
    expert: { ...c.expert },
  }
  if (!config.static.prefix.startsWith('/')) {
    config.static.prefix = '/' + config.static.prefix;
  }
  return config;
}

/**
 * create server handler
 */
export async function createServer(config: IConfig) {
  // create koa instance
  const conf = verifyConfig(config);
  const app = new Koa() as IApp;
  app.on('error', (error) => {
    logger.fail('server error', error.message);
    logger.fail(error.stack);
  });

  // init epii runtime
  const container = new Container();
  container.provide('inject', container);
  container.provide('config', conf);
  container.resolve(path.join(conf.path.root, conf.path.server.service));

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
