import path from 'path';

import send from 'koa-send';

import { IApp, IServerOptions } from '../types';

export default async function staticLayer(app: IApp) {
  const container = app.epii;
  const options = container.service('config') as IServerOptions;

  const staticDir = path.join(options.path.root, options.path.static);
  const staticPrefix = options.static.prefix;

  app.use(async (ctx, next) => {
    // send .well-known
    if (ctx.path.startsWith('/.well-known/')) {
      if (!options.expert['well-known']) {
        ctx.status = 403;
        ctx.body = 'forbidden';
        return;
      }
      await send(ctx, ctx.path, { root: staticDir, hidden: true });
      return;
    }

    // use koa-send
    if (ctx.path.startsWith(staticPrefix)) {
      const name = ctx.path.slice(staticPrefix.length);
      await send(ctx, name, { root: staticDir });
      return;
    }

    await next();
  });
};
