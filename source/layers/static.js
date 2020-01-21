const path = require('path');
const send = require('koa-send');

module.exports = async function staticLayer(app) {
  const config = app.epii.config;

  app.use(async (ctx, next) => {
    let prefix = config.prefix.static;
    const staticDir = path.join(config.path.root, config.path.static);

    // fix prefix for path
    if (!prefix.startsWith('/')) {
      prefix = '/' + prefix;
    }

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
    if (ctx.path.startsWith(prefix)) {
      const name = ctx.path.slice(prefix.length);
      await send(ctx, name, { root: staticDir });
      return;
    }

    await next();
  });
};
