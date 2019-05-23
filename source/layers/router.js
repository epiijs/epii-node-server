const fs = require('fs');
const path = require('path');
const Router = require('@eggjs/router');
const assist = require('../kernel/assist');
const loader = require('../kernel/loader');
const logger = require('../kernel/logger');

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
  // support 'verb' & 'method'
  let routeVerb = (action.verb || action.method || 'GET').toUpperCase();
  // use 'GET' verb by default
  if (verbs.indexOf(routeVerb) < 0) {
    routeVerb = 'GET';
  }

  // todo - normalize action path & body
  // no idea why action = {} but truely happened
  const routePath = action.path;
  const routeBody = action.body;
  if (!routePath || !routeBody) return null;

  return {
    verb: routeVerb,
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
  const routerFiles = fs.readdirSync(routerDir);
  const router = new Router();
  const renderDir = path.join(__dirname, 'render');
  const renderFiles = fs.readdirSync(renderDir);
  const renders = {};

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
      const change = router.stack.findIndex(layer => {
        return layer.name === action.path && layer.methods.indexOf(action.verb) >= 0;
      });
      if (change >= 0) {
        router.stack.splice(change, 1);
      }
      logger.info('reload action', action.path);

      // route action
      // call router.[verb]
      router[action.verb.toLowerCase()].call(
        router,
        action.path,
        action.path,
        renderAction(action)
      );
    });
  }

  // load renders
  renderFiles.forEach(file => {
    const fullPath = path.join(renderDir, file);
    const render = loader.loadFile(fullPath);
    const name = path.basename(file).slice(0, -3);
    renders[name] = render;
    // attach renders to app.epii and auto map to ctx.epii
    assist.internal(app.epii, name, render.order);
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
