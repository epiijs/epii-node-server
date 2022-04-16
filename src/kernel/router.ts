import Koa from 'koa';

export type HTTPMethods = 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'GET' | 'PUT' | 'DELETE';

export interface IActionResult {}

export type ActionFn = (service: any) => Promise<IActionResult | undefined>;

export interface IAction {
  path: string,
  verb: HTTPMethods | HTTPMethods[],
  body: ActionFn,
}

interface IRouteTable {
}

interface IRouter {
  provide: (path: string, method: string[], action: ActionFn) => void;
  handler: () => ((ctx: Koa.Context, next: Koa.Next) => void);
}

export class Router implements IRouter {
  routes: IRouteTable;

  constructor() {
    this.routes = {};
  }

  provide(path: string, method: HTTPMethods[], action: ActionFn) {
    const pathParts = path.split('/');    
  }

  handler() {
    //  app.use(router.allowedMethods());
    return (ctx: Koa.Context, next: Koa.Next) => {

    };
  }
}