import * as path from 'path';

import { Next } from 'koa';
import compose from 'koa-compose';

import logger from '../kernel/logger';
import loader from '../kernel/loader';
import { IInjector, IServiceHandler } from '../kernel/inject';
import { IApp, IServerConfig } from '../server';

export type MiddleFn = (services: IServiceHandler, next: Next) => Promise<void>;

export default async function middleLayer(app: IApp) {
  const injector = app.epii;
  const config = injector.getService('config') as IServerConfig;
  const hotReload = config.expert['hot-reload'];

  const middleDir = path.join(config.path.root, config.path.server.middleware);
  const middleFiles = await loader.listFilesOfDir(middleDir);
  const middleCache: {
    order: string[];
    items: { [key in string]: MiddleFn };
    mixed?: MiddleFn;
  } = {
    order: config.middle.order,
    items: {},
    mixed: undefined
  };

  function loadMiddleModule(p: string) {
    const module = loader.loadModule(p) as MiddleFn;
    const middleName = path.basename(p).replace(/\..*$/, '');
    if (module && typeof module === 'function') {
      middleCache.items[middleName] = module;
    } else {
      delete middleCache.items[middleName];
    }
  }

  function mixupMiddles() {
    const series = middleCache.order
      .map(name => middleCache.items[name])
      .filter(Boolean); // null occurs when reloading
    return series.length > 0 ? compose(series) : null;
  }

  middleFiles.forEach((file) => {
    const fullPath = path.join(middleDir, file);
    loadMiddleModule(fullPath);
  });
  mixupMiddles.mixed = mixupMiddles();

  if (hotReload) {
    loader.watchTarget(middleDir, (event, fullPath) => {
      const file = path.relative(middleDir, fullPath);
      logger.warn(`[middleware] ${event} ${file}`);
      loadMiddleModule(fullPath);
      mixupMiddles.mixed = mixupMiddles();
    });
  }

  app.use(async (ctx, next) => {
    if (middleCache.mixed) {
      const sessionInjector = ctx.epii as IInjector;
      await middleCache.mixed.call(null, sessionInjector.getHandler(), next);
    } else {
      await next();
    }
  });
};
