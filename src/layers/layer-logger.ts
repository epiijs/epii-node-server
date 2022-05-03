import logger from '../kernel/logger';
import { IApp, IServerConfig } from '../server';

export default async function loggerLayer(app: IApp) {
  const injector = app.epii;
  const config = injector.getService('config') as IServerConfig;

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
