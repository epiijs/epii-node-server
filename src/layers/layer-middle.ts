import path from 'path';

import Koa from 'koa';
import compose from 'koa-compose';

import loader from '../kernel/loader';
import logger from '../kernel/logger';
import { IApp, IServerOptions } from '../types';

export type MiddleFn = (service: any, next: Koa.Next) => any;

interface IMiddleCache {
  order: string[];
  items: {
    [key in string]: MiddleFn
  },
  mixup: MiddleFn;
}

const middleCache: IMiddleCache = { order: [], items: {}, mixup: null };

function checkOrder(order: any): string[] {
  if (!Array.isArray(order)) {
    logger.error('invalid middleware order');
    return [];
  }
  return order;
}

function cacheMiddle(file: string, module: any) {
  const name = path.basename(file).slice(0, -3);
  if (name === '$order') {
    middleCache.order = checkOrder(module);
  } else {
    middleCache.items[name] = module;
  }
}

function mergeMiddles() {
  let series: MiddleFn[] = [];
  middleCache.order.forEach((name) => {
    const item = middleCache.items[name];
    if (item) {
      if (Array.isArray(item)) {
        series = series.concat(item);
      } else if (typeof item === 'function') {
        series.push(item);
      }
    }
  });
  middleCache.mixup = series.length > 0 ? compose(series) : null;
}

export default async function middleLayer(app: IApp) {
  const container = app.epii;
  const options = container.service('config') as IServerOptions;

  const middleDir = path.join(options.path.root, options.path.server.middleware);
  const middleFiles = (await loader.getFilesInDir(middleDir)).filter(e => !e.startsWith('$'));

  middleFiles.forEach((file) => {
    const fullPath = path.join(middleDir, file);
    const module = loader.loadModule(fullPath);
    if (module) {
      cacheMiddle(file, module);
    }
  });
  mergeMiddles();

  loader.watchFilesInDir('middleware', middleDir, (event, fullPath) => {
    if (event === 'add' || event === 'update') {
      const module = loader.loadModule(fullPath);
      if (module) {
        cacheMiddle(fullPath, module);
        mergeMiddles();
      }
    }
  });

  app.use(async (ctx, next) => {
    if (middleCache.mixup) {
      const sessionContainer = ctx.epii;
      await middleCache.mixup.call(null, sessionContainer.service(), next);
    } else {
      await next();
    }
  });
};
