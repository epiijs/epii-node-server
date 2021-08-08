import path from 'path';
import loader from './loader';
import logger from './logger';

type HandleResolve = string | ((name: string) => string);

interface IServiceOptions {
  writable?: boolean;
  callable?: boolean;
}

interface IService extends IServiceOptions {
  service: any;
}

export interface IContainer {
  provide: (name: string, service: any, options: any) => void;
  resolve: (name: HandleResolve) => void;
  inherit: () => IContainer;
  service: (name?: string) => any;
  dispose: () => void;
}

function concatPath(root: HandleResolve, name: string) {
  if (typeof root === 'function') {
    return root(name);
  }
  return path.join(root, name);
}

export default class Container implements IContainer {
  ancestor: IContainer | null;
  services: {
    [key in string]: IService;
  };
  resolves: HandleResolve[];
  entrance: any;

  constructor() {
    this.ancestor = null;
    this.services = {};
    this.resolves = [];
    this.entrance = null;
  }

  provide(name: string, service: any, options: IServiceOptions = {}) {
    if (!name || !service) return;
    const dep = this.services[name];
    if (dep && !dep.writable) return;
    this.services[name] = {
      service,
      writable: options.writable != null ? options.writable : true,
      callable: options.callable != null ? options.callable : true,
    };
  }

  resolve(name: HandleResolve) {
    if (!name) return;
    if (this.resolves.indexOf(name) < 0) {
      this.resolves.push(name);
    }
  }

  inherit(): IContainer {
    const container = new Container();
    container.ancestor = this;
    return container;
  }

  service(name?: string): any {
    // 0. proxy service(name)
    if (!name) {
      if (!this.entrance) {
        this.entrance = new Proxy({}, {
          get: (target, property) => {
            if (typeof property === 'string') {
              this.service.call(this, property);
            }
          },
        });
      }
      return this.entrance;
    }

    // 1. get service directly
    if (name in this.services) {
      const dep = this.services[name];
      if (dep.callable && typeof dep.service === 'function') {
        return dep.service(this.service());
      }
      return dep.service;
    }

    // 2. get service of ancestor
    if (this.ancestor) {
      return this.ancestor.service(name);
    }

    // 3. load external service
    for (let i = 0; i < this.resolves.length; i += 1) {
      const file = concatPath(this.resolves[i], name + '.js');
      if (!file) continue;
      const dep = loader.loadModule(file);
      if (dep != null) {
        this.provide(name, dep);
        return this.service(name);
      }
    }

    // 4. service not found
    logger.warn(`service [${name}] not found`);
    return null;
  }

  dispose() {
    this.ancestor = null;
    this.services = {};
    this.resolves = [];
    this.entrance = null;
  }
}
