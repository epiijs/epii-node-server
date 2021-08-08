import { Context, Next } from 'koa';
import { ActionFn } from './define';

export type HTTPMethods = 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'GET' | 'PUT' | 'DELETE';

interface IRouteTable {
}

interface IRouter {
  refresh: (path: string, method: string[], action: ActionFn) => void;
  
}

// TODO - 注册路由、检索路由
export default class Router implements IRouter {
  routes: IRouteTable;

  constructor() {
    this.routes = [];
  }

  refresh(path: string, method: string[], action: ActionFn) {
    const pathParts = path.split('/');
    
  }

  handler() {
    //  app.use(router.allowedMethods());
    return (ctx: Context, next: Next) => {

    };
  }
}