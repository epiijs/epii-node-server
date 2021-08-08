import path from 'path';
import compose from 'koa-compose';
import loader from '../kernel/loader';
import logger from '../kernel/logger';
import { IApp, IConfig, MiddleFn, } from '../kernel/define';

interface IMiddleCache {
  order: string[];
  items: {
    [key in string]: MiddleFn
  },
  mixed: MiddleFn | null;
}

const middleCache: IMiddleCache = { order: [], items: {}, mixed: null };

function lintOrder(order: any): string[] {
  if (!Array.isArray(order)) {
    logger.fail('invalid middleware order');
    return [];
  }
  return order;
}

function composeMiddles() {
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
  middleCache.mixed = series.length > 0 ? compose(series) : null;
}

function reloadMiddle(file: string, module: any) {
  const name = path.basename(file).slice(0, -3);
  if (name === '$order') {
    middleCache.order = lintOrder(module);
  } else {
    middleCache.items[name] = module;
  }
}

module.exports = async function middleLayer(app: IApp) {
  const container = app.epii;
  const config = container.service('config') as IConfig;

  const middleDir = path.join(config.path.root, config.path.server.middleware);
  const middleFiles = (await loader.getSubFiles(middleDir)).filter(e => !e.startsWith('$'));

  middleFiles.forEach((file) => {
    const fullPath = path.join(middleDir, file);
    const module = loader.loadModule(fullPath);
    if (module) {
      reloadMiddle(file, module);
    }
  });
  composeMiddles();

  loader.autoLoadDir('middleware', middleDir, (error, module, file) => {
    if (module) {
      reloadMiddle(file, module);
      composeMiddles();
    }
  });

  app.use(async (ctx, next) => {
    if (middleCache.mixed) {
      const sessionContainer = ctx.epii;
      await middleCache.mixed.call(null, sessionContainer.service(), next);
    } else {
      await next();
    }
  });
};
