/* eslint-disable global-require */

const assist = require('../kernel/assist');

module.exports = async function launchLayer(app) {
  const container = app.epii;
  const config = container.service('config');

  app.use(async (ctx, next) => {
    // create session container
    const sessionContainer = container.inherit();
    sessionContainer.provide('context', ctx, { writable: false, destructurable: config.expert['inject-koa'], });
    assist.internal(ctx, 'epii', sessionContainer);
    await next();
  });

  // support body parser
  // use body by ctx.request.body
  app.use(require('koa-bodyparser')({ strict: false }));
};
