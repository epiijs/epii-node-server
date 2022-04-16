import path from 'path';

import { Context, Next } from 'koa';
import lodash from 'lodash';

import loader from '../kernel/loader';
import logger from '../kernel/logger';
import { ActionFn, Router } from '../kernel/router';
import renders from '../renders';
import { IApp, IServerOptions } from '../types';

type RenderFn = (ctx: Context, result: IActionResult) => void;

function arrayify(o: any): any[] {
  return Array.isArray(o) ? o : [o];
}

/**
 * lint action
 *
 * @param  {Object} action
 */
function lintAction(action) {
  // normalize action verb
  // support 'verb' & 'method' & 'verbs' & 'methods'
  let routeVerbs = lodash.uniq(
    arrayify(action.verb || action.method || action.verbs || action.methods)
      .filter(e => typeof e === 'string')
      .map(e => e.toUpperCase())
      .filter(e => VERBS.indexOf(e) >= 0)
  );
  // use 'GET' verb by default
  if (routeVerbs.length === 0) {
    routeVerbs = ['GET'];
  }
  // todo - normalize action path & body
  // no idea why action = {} but truely happened
  const routePath = action.path;
  const routeBody = action.body;
  if (!routePath || !routeBody) return null;

  return {
    verbs: routeVerbs,
    path: routePath,
    body: routeBody
  };
}

/**
 * lint result
 *
 * @param  {Object} result
 */
function lintResult(result) {
  if (!result) return null;
  if (!result.type) return null;
  return result;
}

function getActionCall(action: IAction) {
  return async (ctx: Context, next: Next) => {
    const sessionContainer = ctx.epii;
    const result = lintResult(await action.body.call(ctx, sessionContainer.service())) as IActionResult;
    result.route = { verb: action.verb, path: action.path };

    // render for not-found
    if (!result) {
      if (!ctx.body) {
        ctx.status = 404;
        ctx.body = 'not found';
      }
      await next();
      return;
    }

    const renderActionResult = renders[result.type] as RenderFn;
    try {
      await renderActionResult(ctx, result);
    } catch (error) {
      ctx.status = 500;
      ctx.body = error.stack;
    }

    await next();
  };
}

function mountRoutes(router: Router, module: any): ActionFn[] {
  const result: ActionFn[] = [];
  const actions = arrayify(module);
  actions.forEach(action => {
    // .map(lintAction).filter(Boolean).forEach((action) => {
    //   // reload action
    //   action.verbs.forEach((verb) => {
    //     const change = router.stack.findIndex(layer => {
    //       return layer.path === action.path && layer.methods.indexOf(verb) >= 0;
    //     });
    //     if (change >= 0) {
    //       router.stack.splice(change, 1);
    //       logger.info('reload action', verb, action.path);
    //     }
  
    //     router.provide(action.path, verb.toLowerCase(), getActionCall(action));      
    //   });
    // });
  });
  return result;
}

export default async function routerLayer(app: IApp) {
  const container = app.epii;
  const options = container.service('config') as IServerOptions;

  const router = new Router();

  const routerDir = path.join(options.path.root, options.path.server.controller);
  const routerFiles = await loader.getFilesInDir(routerDir);

  routerFiles.forEach(file => {
    const fullPath = path.join(routerDir, file);
    const module = loader.loadModule(fullPath);
    mountRoutes(router, module);
  });

  loader.watchFilesInDir('controller', routerDir, (event, p) => {
    const module = loader.loadModule(p);
    mountRoutes(router, module);
  });

  app.use(router.handler());
};
