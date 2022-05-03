import { Injector } from '../kernel/inject';
import { CreateActionResultFn } from '../kernel/render';
import { IApp } from '../server';
import renders from '../renders';

export default async function launchLayer(app: IApp) {
  const injectorForApp = app.epii;

  // expose render handler
  const renderHandler: {
    [key in string]: CreateActionResultFn;
  } = {};
  Object.keys(renders).forEach((key) => {
    renderHandler[key] = renders[key].createActionResult;
  });
  injectorForApp.setService('renders', renderHandler);

  // bind container with context
  app.use(async (ctx, next) => {
    const injectorForSession = new Injector();
    injectorForSession.setInherit(injectorForApp);
    injectorForSession.setService('context', ctx, { writable: false, });

    ctx.epii = injectorForSession;

    await next();

    injectorForSession.dispose();
    ctx.epii = null;
  });

  // support body parser
  // use body by ctx.request.body
  app.use(require('koa-bodyparser')({ strict: false }));
};
