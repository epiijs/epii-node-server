import { Context, Next } from 'koa';
import { ActionFn } from './define';

const VERBS = ['HEAD', 'OPTIONS', 'PATCH', 'POST', 'GET', 'PUT', 'DELETE'];

interface IRouteTable {
}

interface IRouter {
  provide: (path: string, method: string[], action: ActionFn) => void;
}

export default class Router implements IRouter {
  routes: IRouteTable;

  constructor() {
    this.routes = [];
  }

  provide(path: string, method: string[], action: ActionFn) {
    const pathParts = path.split('/');
    
  }

  service() {
    //  app.use(router.allowedMethods());
    return (ctx: Context, next: Next) => {

    };
  }
}