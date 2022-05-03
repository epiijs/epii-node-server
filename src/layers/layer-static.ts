import * as path from 'path';

const koaSend = require('koa-send');

import { IApp, IServerConfig } from '../server';

export default async function staticLayer(app: IApp) {
  const injector = app.epii;
  const config = injector.getService('config') as IServerConfig;

  const staticDir = path.join(config.path.root, config.path.static);
  const staticPrefix = config.static.prefix;

  app.use(async (ctx, next) => {
    // send .well-known
    if (ctx.path.startsWith('/.well-known/')) {
      if (!config.expert['well-known']) {
        ctx.status = 403;
        ctx.body = 'forbidden';
        return;
      }
      await koaSend(ctx, ctx.path, { root: staticDir, hidden: true });
      return;
    }

    // send other by koa-send
    if (ctx.path.startsWith(staticPrefix)) {
      const name = ctx.path.slice(staticPrefix.length);
      await koaSend(ctx, name, { root: staticDir });
      return;
    }

    await next();
  });
};
