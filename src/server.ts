import * as path from 'path';
import * as Koa from 'koa';

import { IInjector, Injector } from './kernel/inject';
import logger from './kernel/logger';
import layers from './layers';

export interface IApp extends Koa {
  epii: IInjector;
}

export interface IServerConfig {
  name: string;
  port: number;

  path: {
    root: string;
    static: string;
    server: {
      service: string;
      middleware: string;
      controller: string;
      document: string;
    }
  },

  middle: {
    order: string[];
  },

  static: {
    prefix: string;
  },

  expert: {
    'hot-reload': boolean;
    'well-known': boolean;
  }
}

function checkConfig(config: any): IServerConfig {
  const result: IServerConfig = {
    name: config.name || 'unknown',
    port: config.port || '8080',
    path: { ...config.path },
    middle: {
      order: []
    },
    static: {
      prefix: '/__file'
    },
    expert: {
      'well-known': false,
      'hot-reload': false,
      ...config.expert
    }
  };
  if (config?.middle?.order) {
    if (config.middle.order.every((e: any) => typeof e === 'string')) {
      result.middle.order = config.middle.order;
    }
  }
  if (config?.static?.prefix) {
    if (typeof config.static.prefix === 'string') {
      result.static.prefix = '/' + config.static.prefix;
    }
  }
  return result;
}

/**
 * create server handler
 */
export async function createServer(config: IServerConfig) {
  const checkedConfig = checkConfig(config);

  const app: IApp = new Koa.default() as IApp;
  app.on('error', (error) => {
    logger.error('server error', error.message);
    logger.error(error.stack);
  });

  // init epii runtime
  const injector = new Injector();
  injector.setService('inject', injector);
  injector.setService('config', checkedConfig);
  injector.setResolve(path.join(checkedConfig.path.root, checkedConfig.path.server.service));

  // bind readonly epii namespace
  Object.defineProperty(app, 'epii', {
    value: injector,
    enumerable: true,
    writable: false,
    configurable: false,
  });

  // init all layers
  await layers.launch(app); // init injector and parser
  await layers.static(app); // respond with static files
  await layers.middle(app); // proceed custom middlewares
  await layers.action(app); // proceed custom controllers
  await layers.logger(app); // measure and log by loggers

  return app.callback();
}
