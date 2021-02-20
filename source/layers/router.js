const path = require('path');
const lodash = require('lodash');
const Router = require('@eggjs/router');
const assist = require('../kernel/assist');
const loader = require('../kernel/loader');
const logger = require('../kernel/logger');
const renders = require('../render');

const verbs = [
  'HEAD', 'OPTIONS', 'PATCH',
  'POST', 'GET', 'PUT', 'DELETE'
];

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
      .filter(e => verbs.indexOf(e) >= 0)
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

module.exports = async function routerLayer(app) {
  const config = app.epii.config;
  const routerDir = path.join(config.path.root, config.path.server.controller);
  const routerFiles = await loader.getSubFiles(routerDir);
  const router = new Router();

  function renderAction(action) {
    return async (ctx, next) => {
      const result = lintResult(await action.body.call(ctx));
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
      const render = renders[result.type];
      try {
        await render.solve(ctx, result);
      } catch (error) {
        ctx.status = 500;
        ctx.body = error.stack;
      }
      ctx.epii.cache('action', result);
      await next();
    };
  }

  function loadAction(e, o) {
    assist.arrayify(o).map(lintAction).filter(Boolean).forEach(action => {
      // reload action
      action.verbs.forEach((verb) => {
        const change = router.stack.findIndex(layer => {
          return layer.path === action.path && layer.methods.indexOf(verb) >= 0;
        });
        if (change >= 0) {
          router.stack.splice(change, 1);
          logger.info('reload action', verb, action.path);
        }

        // route action
        // call router.[verb]
        router[verb.toLowerCase()].call(
          router,
          action.path,
          renderAction(action)
        );
      });
    });
  }

  // attach renders to app.epii and auto map to ctx.epii
  Object.keys(renders).forEach(key => {
    assist.internal(app.epii, key, renders[key].order);
  });

  // load routers
  routerFiles.forEach(file => {
    const fullPath = path.join(routerDir, file);
    loader.loadFile(fullPath, loadAction);
  });
  loader.autoLoadDir('controller', routerDir, loadAction);

  // use router
  app.use(router.routes());
  app.use(router.allowedMethods());
};
