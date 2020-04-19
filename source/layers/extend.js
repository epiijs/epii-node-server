/* eslint-disable global-require */

const assist = require('../kernel/assist');
const logger = require('../kernel/logger');

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
  const config = app.epii.config;

  const globalCache = {};
  const globalPerfs = {
    requestCount: 0
  };
  assist.internal(app.epii, 'perfs', globalPerfs, { enumerable: false });
  assist.internal(app.epii, 'cache', accessCache(globalCache), { enumerable: false });

  app.use(async (ctx, next) => {
    // log for incoming message
    // logger.info(`=> [${config.name}] <${ctx.method}> ${ctx.path}`);

    // bind context cache and perfs
    const sessionCache = {};
    const sessionPerfs = {
      launch: Date.now(),
      elapse: 0
    };
    assist.internal(ctx.epii, 'perfs', accessCache(sessionCache), { enumerable: false });
    assist.internal(ctx.epii, 'cache', accessCache(sessionCache));

    // attach app.epii API to ctx.epii
    Object.keys(app.epii).forEach(key => {
      ctx.epii[key] = app.epii[key];
    });

    // proceed pipelines
    await next();

    // update perfs and log
    sessionPerfs.elapse = Date.now() - sessionPerfs.launch;
    logger.info(`<= [${config.name}] <${ctx.method}> ${ctx.status} ${sessionPerfs.elapse}ms ${ctx.path}`);
    globalPerfs.requestCount += 1;
  });

  // support body parser
  // use body by ctx.request.body
  app.use(require('koa-bodyparser')({ strict: false }));

  // todo - support plugin
  // todo - support inject for service
};
