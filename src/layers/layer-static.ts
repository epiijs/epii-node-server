import * as path from 'path';

const koaSend = require('koa-send');

import { IApp, IServerConfig } from '../types';

export default async function staticLayer(app: IApp) {
  const injector = app.epii;
  const config = injector.service('config') as IServerConfig;

  const staticDir = path.join(config.root, config.path.static);
  const staticPrefix = config.static.prefix;

  app.use(async (ctx, next) => {
    // send static files
    if (ctx.path.startsWith(staticPrefix)) {
      const name = ctx.path.slice(staticPrefix.length);
      await koaSend(ctx, name, { root: staticDir });
      return;
    }

    // send expose files
    if (config.static.expose.some(e => ctx.path.startsWith(e))) {
      await koaSend(ctx, ctx.path, { root: staticDir, hidden: true });
      return;
    }

    await next();
  });
};
