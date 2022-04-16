import { IApp } from "../types";

export default async function launchLayer(app: IApp) {
  const container = app.epii;

  // bind container with context
  app.use(async (ctx, next) => {
    const sessionContainer = container.inherit();
    sessionContainer.provide('context', ctx, { writable: false, });
    ctx.epii = sessionContainer;

    await next();

    ctx.epii = null;
    sessionContainer.dispose();
  });

  // support body parser
  // use body by ctx.request.body
  app.use(require('koa-bodyparser')({ strict: false }));
};
