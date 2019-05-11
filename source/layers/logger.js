const assist = require('../kernel/assist');
const logger = require('../kernel/logger');

module.exports = async function loggerLayer(app) {
  // bind counts
  const counts = {
    request: 0
  };
  assist.internal(app.epii, 'counts', counts);

  const config = app.epii.config;
  app.use(async (ctx, next) => {
    logger.info(`[${config.name}] <${ctx.status}> ${ctx.path}`);
    counts.request += 1;
    await next();
  });
};
