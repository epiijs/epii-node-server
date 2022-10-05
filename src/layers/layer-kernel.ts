import { Injector } from '@epiijs/inject';

import logger from '../logger';
import renders from '../renders';
import { CreateActionResultFn, IApp, IServerConfig } from '../types';

export default async function kernelLayer(app: IApp) {
  // init app apis
  const injectorForApp = app.epii;
  const renderHandler: {
    [key in string]: CreateActionResultFn;
  } = {};
  Object.keys(renders).forEach(key => {
    renderHandler[key] = renders[key].createActionResult;
  });
  injectorForApp.provide('render', renderHandler, { writable: false });

  // init app perfs
  const globalPerfs = {
    requestCount: 0
  };

  app.use(async (ctx, next) => {
    // bind session injector with context
    const injectorForSession = new Injector();
    injectorForSession.inherit(injectorForApp);
    injectorForSession.provide('context', ctx, { writable: false });
    ctx.epii = injectorForSession; /* cannot writable = false */

    // update perfs
    globalPerfs.requestCount += 1;
    const sessionPerfs = {
      launch: Date.now(),
      elapse: 0,
    };

    await next();

    // update perfs
    const config = injectorForApp.service('config') as IServerConfig;
    sessionPerfs.elapse = Date.now() - sessionPerfs.launch;
    logger.info(`[${config.name}] ${sessionPerfs.elapse}ms ${ctx.status} <${ctx.method}> ${ctx.path}`);

    // dispose context
    injectorForSession.dispose();
    ctx.epii = null;
  });

  // support body parser
  // use body by ctx.request.body
  app.use(require('koa-bodyparser')({ strict: false }));
};
