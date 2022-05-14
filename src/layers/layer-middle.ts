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
    items: { [key in string]: MiddleFn };
    entry?: MiddleFn;
  } = {
    items: {},
    entry: undefined
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

  function composeMiddles(): MiddleFn | undefined {
    const middles = config.middle.series
      .map(name => middleCache.items[name])
      .filter(Boolean); // null occurs when reloading
    console.log(config.middle, middles);
    return middles.length > 0 ? compose(middles) : undefined;
  }

  middleFiles.forEach((file) => {
    const fullPath = path.join(middleDir, file);
    loadMiddleModule(fullPath);
  });
  middleCache.entry = composeMiddles();

  if (hotReload) {
    loader.watchTarget(middleDir, (event, fullPath) => {
      const file = path.relative(middleDir, fullPath);
      logger.warn(`[middleware] ${event} ${file}`);
      loadMiddleModule(fullPath);
      middleCache.entry = composeMiddles();
    });
  }

  app.use(async (ctx, next) => {
    if (middleCache.entry) {
      const sessionInjector = ctx.epii as IInjector;
      await middleCache.entry.call(null, sessionInjector.getHandler(), next);
    } else {
      await next();
    }
  });
};
