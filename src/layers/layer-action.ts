import * as path from 'path';

import { IInjector } from '@epiijs/inject';

import loader from '../loader';
import logger from '../logger';
import { HTTPMethod, IRouteRule, isRouteEqual, Router } from '../../old/kernel/router';
import renders from '../renders';
import { ActionFn, IActionResult, IApp, IServerConfig } from '../types';

function arrayify(o: any): any[] {
  if (!o) { return []; }
  return Array.isArray(o) ? o : [o];
}

export interface IAction {
  route: IRouteRule;
  entry: ActionFn;
}

function lintAction(action: any): IAction {
  // // normalize action verb
  // // support 'verb' & 'method' & 'verbs' & 'methods'
  // let routeVerbs = uniq(
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
  const config = injector.service('config') as IServerConfig;
  const hotReload = config.loader.reload;

  const router = new Router();

  const actionDir = path.join(config.root, config.path.controller);
  const actionFiles = await loader.listFilesOfDir(actionDir);

  const mapOfRouteRulesForFile: { [key in string]: IRouteRule[] } = {};

  function loadActionsModule(p: string) {
    const actions = arrayify(loader.loadModule(p)).map(e => lintAction(e));
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
      // TODO - handle error
      ctx.status = matchResult.error;
      await next();
      return;
    }

    const sessionInjector = ctx.epii as IInjector;
    sessionInjector.provide('params', matchResult.params);
    const actionFn = matchResult.extra as ActionFn;
    const actionResult = await actionFn(sessionInjector.handler());
    // TODO - catch and handle error
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
