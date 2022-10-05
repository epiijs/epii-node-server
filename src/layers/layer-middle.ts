import * as path from 'path';

import compose from 'koa-compose';

import { IInjector } from '@epiijs/inject';

import loader from '../loader';
import logger from '../logger';
import { IApp, IServerConfig, MiddleFn } from '../types';

export default async function middleLayer(app: IApp) {
  const injector = app.epii;
  const config = injector.service('config') as IServerConfig;
  const hotReload = config.loader.reload;

  const middleDir = path.join(config.root, config.path.middleware);
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
    const middles = config.loader.middleware
      .map(name => middleCache.items[name])
      .filter(Boolean); // null occurs when reloading
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
      await middleCache.entry.call(null, sessionInjector.handler(), next);
    } else {
      await next();
    }
  });
};
