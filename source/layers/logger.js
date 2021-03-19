const assist = require('../kernel/assist');
const logger = require('../kernel/logger');

module.exports = async function loggerLayer(app) {
  const config = app.epii.config;
  const globalPerfs = {
    requestCount: 0
  };
  assist.internal(app.epii, 'perfs', globalPerfs);

  app.use(async (ctx, next) => {
    const sessionPerfs = {
      launch: Date.now(),
      elapse: 0
    };
    assist.internal(ctx.epii, 'perfs', sessionPerfs);

    await next();

    sessionPerfs.elapse = Date.now() - sessionPerfs.launch;
    logger.info(`[${config.name}] ${ctx.status} ${sessionPerfs.elapse}ms <${ctx.method}> ${ctx.path}`);
    globalPerfs.requestCount += 1;
  });
};
