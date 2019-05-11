const path = require('path');
const send = require('koa-send');

module.exports = async function staticLayer(app) {
  const config = app.epii.config;

  app.use(async (ctx, next) => {
    let prefix = config.prefix.static;

    // fix prefix for path
    if (!prefix.startsWith('/')) prefix = '/' + prefix;

    // use koa-send
    if (ctx.path.startsWith(prefix)) {
      const name = ctx.path.slice(prefix.length);
      await send(ctx, name, {
        root: path.join(config.path.root, config.path.static)
      });
      return;
    }

    await next();
  });
};
