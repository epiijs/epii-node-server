import path from 'path';
import lodash from 'lodash';
import loader from '../kernel/loader';
import logger from '../kernel/logger';
import Router from '../kernel/router';
import renders from '../renders';
import { IApp, IConfig } from '../kernel/define';

const router = new Router();

/**
 * lint action
 *
 * @param  {Object} action
 */
function lintAction(action) {
  // normalize action verb
  // support 'verb' & 'method' & 'verbs' & 'methods'
  let routeVerbs = lodash.uniq(
    assist.arrayify(action.verb || action.method || action.verbs || action.methods)
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

function getActionCall(action) {
  return async (ctx, next) => {
    // call action
    const sessionContainer = ctx.epii;
    const result = lintResult(await action.body.call(ctx, sessionContainer.service()));

    // render for not-found
    if (!result) {
      if (!ctx.body) {
        ctx.status = 404;
        ctx.body = 'not found';
      }
      await next();
      return;
    }

    // render for action result
    result.route = { verb: action.verb, path: action.path };
    try {
      await renders[result.type].solve(ctx, result);
    } catch (error) {
      ctx.status = 500;
      ctx.body = error.stack;
    }

    await next();
  };
}

function loadAction(error: Error, module: any) {
  assist.arrayify(o).map(lintAction).filter(Boolean).forEach((action) => {
    // reload action
    action.verbs.forEach((verb) => {
      const change = router.stack.findIndex(layer => {
        return layer.path === action.path && layer.methods.indexOf(verb) >= 0;
      });
      if (change >= 0) {
        router.stack.splice(change, 1);
        logger.info('reload action', verb, action.path);
      }

      router.provide(action.path, verb.toLowerCase(), getActionCall(action));      
    });
  });
}

export default async function routerLayer(app: IApp) {
  const container = app.epii;
  const config = container.service('config') as IConfig;

  const renderBuilders = {};
  Object.keys(renders).forEach((key) => {
    renderBuilders[key] = renders[key].order;
  });
  container.provide('renders', renderBuilders);

  const routerDir = path.join(config.path.root, config.path.server.controller);
  const routerFiles = await loader.getSubFiles(routerDir);

  routerFiles.forEach(file => {
    const fullPath = path.join(routerDir, file);
    loader.loadModule(fullPath, loadAction);
  });
  loader.autoLoadDir('controller', routerDir, loadAction);

  app.use(router.routes());
};
