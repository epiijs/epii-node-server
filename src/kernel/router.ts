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

export interface IRouteParams {
  [key: string]: string;
}

interface IPathTree {
  name: string;
  value?: unknown;
  nodes: {
    // => /simple-string
    forOne: Record<string, IPathTree>;
    // => /:variable
    forVar: Record<string, IPathTree>;
    // => /*
    forAny: IPathTree | null;
  };

  appendNode: (node: IPathTree) => void;
  searchNode: (names: string[]) => [IPathTree | null, IRouteParams];
}

class PathTree implements IPathTree {
  name: string;
  value?: unknown;
  nodes: {
    forOne: Record<string, IPathTree>;
    forVar: Record<string, IPathTree>;
    forAny: IPathTree | null;
  };

  constructor(name: string) {
    this.name = name;
    this.nodes = { forOne: {}, forVar: {}, forAny: null };
  }

  appendNode(node: IPathTree): void {
    if (node.name === '*') {
      this.nodes.forAny = node;
    }
    if (node.name.startsWith(':')) {
      this.nodes.forVar[node.name] = node;
    }
    this.nodes.forOne[node.name] = node;
  }

  searchNode(names: string[]): [IPathTree | null, IRouteParams] {
    const restNames = names.slice(1);
    const nodeForOne = this.nodes.forOne[names[0]]?.searchNode(restNames);
    if (nodeForOne) {
      return nodeForOne;
    }
    for (const node of Object.values(this.nodes.forVar)) {
      const nodeForVar = node.searchNode(restNames);
      if (nodeForVar) {
        return nodeForVar;
      }
    }
    const nodeForAny = this.nodes.forAny;
    if (nodeForAny) {
      return [nodeForAny, {}];
    }
    return [null, {}];
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
  params: IRouteParams;
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

  splitPath(source: string): string[] {
    return source.replace(/^\/+/, '').split('/');
  }

  isPathTreeValueEmpty(value: IPathTreeValue): boolean {
    if (!value) return true;
    if (!value.methods) return true;
    if (Object.keys(value.methods).length < 1) return true;
    return false;
  }

  constructor() {
    this.routes = new PathTree('/');
  }

  appendRule(rule: IRouteRule, extra: any) {
    const { pattern, methods } = rule;
    const names = this.splitPath(pattern);
    let cursor = this.routes;
    for (const name of names) {
      const node = new PathTree(name);
      cursor.appendNode(node);
      cursor = node;
    }
    const value = (cursor.value as IPathTreeValue) || { methods: {} };
    for (const method of methods) {
      value.methods[method] = extra;
    }
    cursor.value = value;
  }

  removeRule(rule: IRouteRule) {
    const { pattern, methods } = rule;
    const names = this.splitPath(pattern);
    const [node] = this.routes.searchNode(names);
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
    const names = this.splitPath(path);
    const [node, params] = this.routes.searchNode(names);
    const result: IRouteResult = { params };
    if (node) {
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