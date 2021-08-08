import path from 'path';
import send from 'koa-send';
import { IApp, IConfig } from '../kernel/define';

module.exports = async function staticLayer(app: IApp) {
  const container = app.epii;
  const config = container.service('config') as IConfig;

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
