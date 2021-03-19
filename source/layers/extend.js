/* eslint-disable global-require */

const assist = require('../kernel/assist');

/**
 * get cache accessor
 *
 * @param  {Object} result
 * @return {Function} (key, value) for object
 */
function accessCache(cache) {
  const stub = cache;
  return (key, value) => {
    if (!key) return undefined;
    if (value != null) stub[key] = value;
    return stub[key];
  };
}

module.exports = async function extendLayer(app) {
  const globalCache = {};
  assist.internal(app.epii, 'cache', accessCache(globalCache));

  app.use(async (ctx, next) => {
    const sessionCache = {};
    assist.internal(ctx.epii, 'cache', accessCache(sessionCache));

    // proceed pipelines
    await next();
  });

  // support body parser
  // use body by ctx.request.body
  app.use(require('koa-bodyparser')({ strict: false }));

  // todo - support plugin
  // todo - support inject for service
};
