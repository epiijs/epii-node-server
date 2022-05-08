import * as path from 'path';

import logger from '../kernel/logger';
import loader from '../kernel/loader';
import { IInjector, IServiceHandler } from '../kernel/inject';
import { HTTPMethod, IRouteRule, isRouteEqual, Router } from '../kernel/router';
import { IActionResult } from '../kernel/render';
import { IApp, IServerConfig } from '../server';
import renders from '../renders';

export type ActionFn = (services: IServiceHandler) => Promise<IActionResult>;

export interface IAction {
  route: IRouteRule;
  entry: ActionFn;
}

function arrayify(o: any): any[] {
  return o ? (Array.isArray(o) ? o : [o]) : [];
}

function checkAction(action: any): IAction {
  // // normalize action verb
  // // support 'verb' & 'method' & 'verbs' & 'methods'
  // let routeVerbs = lodash.uniq(
  //   arrayify(action.verb || action.method || action.verbs || action.methods)
  //     .filter(e => typeof e === 'string')
  //     .map(e => e.toUpperCase())
  //     .filter(e => VERBS.indexOf(e) >= 0)
  // );
  // // use 'GET' verb by default
  // if (routeVerbs.length === 0) {
  //   routeVerbs = ['GET'];
  // }
  // // todo - normalize action path & body
  // // no idea why action = {} but truely happened
  // const routePath = action.path;
  // const routeBody = action.body;
  // if (!routePath || !routeBody) return null;
  const route: IRouteRule = {
    pattern: action.path,
    methods: arrayify(action.verb).map((e: string) => e.toUpperCase() as HTTPMethod)
  };
  return {
    route,
    entry: action.body
  };
}

function checkActionResult(result: any): IActionResult {
  return result;
}

export default async function actionLayer(app: IApp) {
  const injector = app.epii;
  const config = injector.getService('config') as IServerConfig;
  const hotReload = config.expert['hot-reload'];

  const router = new Router();

  const actionDir = path.join(config.path.root, config.path.server.controller);
  const actionFiles = await loader.listFilesOfDir(actionDir);

  const mapOfRouteRulesForFile: { [key in string]: IRouteRule[] } = {};

  function loadActionsModule(p: string) {
    const module = arrayify(loader.loadModule(p));
    const actions = module.map(e => checkAction(e));
    actions.forEach(action => {
      router.appendRule(action.route, action.entry);
    });
    if (hotReload) {
      const rules = mapOfRouteRulesForFile[p] || [];
      rules.forEach(rule => {
        if (actions.every(action => !isRouteEqual(rule, action.route))) {
          router.removeRule(rule);
        }
      });
    }
  }

  actionFiles.forEach(file => {
    const fullPath = path.join(actionDir, file);
    loadActionsModule(fullPath);
  });

  if (hotReload) {
    loader.watchTarget(actionDir, (event, fullPath) => {
      const file = path.relative(actionDir, fullPath);
      logger.warn(`[controller] ${event} ${file}`);
      loadActionsModule(fullPath);
    });
  }

  app.use(async (ctx, next) => {
    const matchResult = router.matchRoute(ctx.path, ctx.method);
    if (matchResult.error) {
      // TODO - handle error?
      ctx.throw(matchResult.error);
    }
    const sessionInjector = ctx.epii as IInjector;
    const entry = matchResult.extra as ActionFn;
    const actionResult = await entry(sessionInjector.getHandler());
    // TODO - catch and handle error?
    // TODO - check action result

    const resultRender = renders[actionResult.type];
    await resultRender.outputActionResult(ctx, actionResult)
      .catch(error => {
        ctx.status = 500;
        ctx.body = error.stack;
      });
    
    await next();
  });
};
