const logger = require('../kernel/logger');

module.exports = async function loggerLayer(app) {
  const container = app.epii;
  const config = container.service('config');

  const globalPerfs = {
    requestCount: 0
  };

  app.use(async (ctx, next) => {
    const sessionPerfs = {
      launch: Date.now(),
      elapse: 0,
    };

    await next();

    sessionPerfs.elapse = Date.now() - sessionPerfs.launch;
    logger.info(`[${config.name}] ${sessionPerfs.elapse}ms ${ctx.status} <${ctx.method}> ${ctx.path}`);

    globalPerfs.requestCount += 1;
  });
};
