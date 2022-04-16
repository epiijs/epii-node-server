import logger from '../kernel/logger';
import { IApp, IServerOptions } from '../types';

export default async function loggerLayer(app: IApp) {
  const container = app.epii;
  const options = container.service('config') as IServerOptions;

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
    logger.info(`[${options.name}] ${sessionPerfs.elapse}ms ${ctx.status} <${ctx.method}> ${ctx.path}`);

    globalPerfs.requestCount += 1;
  });
};
