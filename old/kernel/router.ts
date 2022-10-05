import { IDisposable } from '../types';

export type HTTPMethod = 'HEAD' | 'OPTIONS' | 'GET' | 'PUT' | 'DELETE' | 'POST' | 'PATCH';

export interface IRouteRule {
  pattern: string;
  methods: HTTPMethod[];
}

export function isRouteEqual(a: IRouteRule, b: IRouteRule) {
  const result =
    a.pattern === b.pattern &&
    a.methods.length === b.methods.length &&
    a.methods.every(m => b.methods.indexOf(m) >= 0);
  return result;
}

export interface IPathParams {
  [key: string]: string;
}

interface IPathTree {
  names: string[];
  value?: unknown;
  nodes: {
    // => /simple-string = { name: node }
    forOne: Record<string, IPathTree>;
    // => /:variable = { name: node }
    forVar: Record<string, IPathTree>;
    // => /* = node
    forAny: IPathTree | null;
  };

  appendTree: (path: string) => IPathTree;
  searchTree: (path: string) => IPathTree | null;
  fillParams: (path: string) => IPathParams
}

class PathTree implements IPathTree {
  names: string[];
  value?: unknown;
  nodes: {
    forOne: Record<string, PathTree>;
    forVar: Record<string, PathTree>;
    forAny: PathTree | null;
  };

  splitPath(path: string): string[] {
    return path.replace(/^\/+/, '').split('/');
  }

  mergePath(names: string[]): string {
    return '/' + names.join('/');
  }

  searchNode(names: string[]): PathTree | null {
    const nextNames = names.slice(1);
    const nodeForOne = this.nodes.forOne[names[0]];
    if (nodeForOne) {
      if (nextNames.length === 0) {
        return nodeForOne;
      }
      return nodeForOne.searchNode(nextNames);
    }
    for (const nodeForVar of Object.values(this.nodes.forVar)) {
      if (nextNames.length === 0) {
        return nodeForVar;
      }  
      const nextNode = nodeForVar.searchNode(nextNames);
      if (nextNode) {
        return nextNode;
      }
    }
    const nodeForAny = this.nodes.forAny;
    return nodeForAny || null;
  }

  constructor(names?: string[]) {
    this.names = names || [];
    this.nodes = { forOne: {}, forVar: {}, forAny: null };
  }

  appendTree(path: string): IPathTree {
    const names = this.splitPath(path);
    let cursor: PathTree = this;
    for (const name of names) {
      const newTree = new PathTree(cursor.names.concat(name));
      if (name === '*') {
        cursor = (cursor.nodes.forAny ??= newTree);
      } else if (name.startsWith(':')) {
        cursor = (cursor.nodes.forVar[name] ??= newTree);
      } else {
        cursor = (cursor.nodes.forOne[name] ??= newTree);
      }
    }
    return cursor;
  }

  searchTree(path: string): IPathTree | null {
    const names = this.splitPath(path);
    return this.searchNode(names);
  }

  fillParams(path: string): IPathParams {
    const values = this.splitPath(path);
    const params: IPathParams = {};
    for (let i = 0; i < this.names.length; i += 1) {
      const name = this.names[i];
      if (name.startsWith(':')) {
        params[name.slice(1)] = values[i];
      }
      if (name === '*') {
        params['*'] = values.slice(i).join('/');
        break;
      }
    }
    return params;
  }

  // TODO - throttle minifyTree
}

export enum ERouteError {
  NotFound = 404,
  MethodNotAllowed = 405
};

export interface IRouteResult {
  error?: ERouteError;
  extra?: unknown;
  params: IPathParams;
}

export interface IRouter extends IDisposable {
  appendRule: (rule: IRouteRule, extra: any) => void;
  removeRule: (rule: IRouteRule) => void;
  matchRoute: (path: string, method: string) => IRouteResult
}

interface IPathTreeValue {
  methods: {
    [key in string]: unknown;
  }
}

export class Router implements IRouter {
  routes: PathTree;

  isPathTreeValueEmpty(value: IPathTreeValue): boolean {
    if (!value) return true;
    if (!value.methods) return true;
    if (Object.keys(value.methods).length === 0) return true;
    return false;
  }

  constructor() {
    this.routes = new PathTree();
  }

  appendRule(rule: IRouteRule, extra: any) {
    const { pattern, methods } = rule;
    const node = this.routes.appendTree(pattern);
    if (!node.value) {
      node.value = { methods: {} };
    }
    const value = node.value as IPathTreeValue;
    for (const method of methods) {
      value.methods[method] = extra;
    }
  }

  removeRule(rule: IRouteRule) {
    const { pattern, methods } = rule;
    const node = this.routes.searchTree(pattern);
    if (node) {
      const value = node.value as IPathTreeValue;
      for (const method of methods) {
        delete value.methods[method];
      }
      if (this.isPathTreeValueEmpty(value)) {
        node.value = undefined;
      }
    }
  }

  matchRoute(path: string, method: string): IRouteResult {
    const node = this.routes.searchTree(path);
    const result: IRouteResult = { params: {} };
    if (node) {
      const params = node.fillParams(path);
      const result: IRouteResult = { params };
      const value = node.value as IPathTreeValue;
      if (!this.isPathTreeValueEmpty(value)) {
        const extra = value.methods[method as HTTPMethod];
        if (extra) {
          result.extra = extra;
          return result;
        }
        result.error = ERouteError.MethodNotAllowed;
        return result;
      }
    }
    result.error = ERouteError.NotFound;
    return result;
  }

  dispose() {
  }
}