import * as Koa from 'koa';

import { Injector } from '@epiijs/inject';

import layers from './layers';
import logger from './logger';
import { IApp, IServerConfig } from './types';

function lintConfig(config: IServerConfig): IServerConfig {
  if (!config.root) {
    throw new Error('config.root required');
  }
  const result: IServerConfig = {
    root: config.root,
    name: config.name || 'unknown',
    port: config.port || 8080,
    path: Object.assign({
      service: 'server/service',
      middleware: 'server/middleware',
      controller: 'server/controller',
      portal: 'server/portal',
      static: 'static'
    }, config.path || {}),
    loader: {
      reload: config.loader?.reload || false,
      middleware: config.loader?.middleware || []
    },
    static: {
      prefix: config.static?.prefix || '/__file',
      expose: config.static?.expose || []
    }
  };
  if (result.static?.prefix && result.static?.prefix[0] !== '/') {
    result.static.prefix = '/' + result.static.prefix;
  }
  return result;
}

/**
 * create server handler
 */
export async function createServer(config: IServerConfig) {
  const checkedConfig = lintConfig(config);

  // init koa instance
  const app: IApp = new (Koa as any).default() as IApp;
  app.on('error', error => {
    logger.error('unhandled server error', error.message);
    logger.error(error.stack);
  });

  // init epii runtime
  const injector = new Injector();
  injector.provide('inject', injector, { writable: false });
  injector.provide('config', checkedConfig, { writable: false });
  Object.defineProperty(app, 'epii', {
    value: injector,
    enumerable: true,
    writable: false,
    configurable: false,
  });

  // init app pipeline

  await layers.useKernelLayer(app); // use injector and body-parser and logger
  await layers.useStaticLayer(app); // use handlers for static files
  await layers.useMiddleLayer(app); // use handlers for custom middlewares
  await layers.useActionLayer(app); // use handlers for custom controllers

  // call app callback
  // TODO

  return app.callback();
}
