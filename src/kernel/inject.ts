import * as path from 'path';

import loader from './loader';
import logger from './logger';

import { IDisposable } from '../types';

type TResolve = string | ((name: string) => string);

interface IServiceOptions {
  writable?: boolean;
  callable?: boolean;
}

interface IServiceWrapper extends IServiceOptions {
  provider: any;
}

export interface IServiceHandler {
  [key: string]: unknown;
}

export interface IInjector extends IDisposable {
  setResolve: (name: TResolve) => void;
  setInherit: (base: IInjector) => void;
  setService: (name: string, service: any, options?: IServiceOptions) => void;
  getService: (name: string) => unknown;
  getHandler: () => IServiceHandler;
}

export class Injector implements IInjector {
  services: {
    [key in string]: IServiceWrapper;
  };
  resolves: TResolve[];
  handler?: IServiceHandler;
  inherit?: IInjector;

  constructor() {
    this.services = {};
    this.resolves = [];
    this.inherit = undefined;
    this.handler = undefined;
  }

  setResolve(resolve: TResolve): void {
    if (!resolve) { return; }
    if (this.resolves.indexOf(resolve) < 0) {
      this.resolves.push(resolve);
    }
  }

  setInherit(inherit: IInjector): void {
    this.inherit = inherit;
  }

  setService(name: string, service: any, options: IServiceOptions = {}): void {
    if (!name || !service) { return; }
    const wrapper = this.services[name];
    if (wrapper && !wrapper.writable) { return; }
    this.services[name] = {
      provider: service,
      writable: options.writable != null ? options.writable : true,
      callable: options.callable != null ? options.callable : true,
    };
  }

  getService(name: string): unknown {
    // 1. find service directly
    if (name in this.services) {
      const wrapper = this.services[name];
      if (wrapper.callable && typeof wrapper.provider === 'function') {
        return wrapper.provider(this.handler);
      }
      return wrapper.provider;
    }

    // 2. find service from parent injector
    if (this.inherit) {
      return this.inherit.getService(name);
    }

    // 3. load external service
    if (this.resolves.length > 0) {
      for (let i = 0; i < this.resolves.length; i += 1) {
        const resolve = this.resolves[i];
        const fullPath = typeof resolve === 'function'
          ? resolve(name)
          : path.join(resolve, name);
        if (!fullPath) { continue; }
        const service = loader.loadModule(fullPath);
        if (service != null) {
          this.setService(name, service);
          return this.getService(name);
        }
      }
    }

    // 4. service not found
    logger.warn(`service [${name}] not found`);
    return null;
  }

  getHandler(): IServiceHandler {
    if (!this.handler) {
      this.handler = new Proxy({}, {
        get: (target, property) => {
          if (typeof property === 'string') {
            return this.getService(property);
          }
        },
      });
    }
    return this.handler;
  }

  dispose() {
    this.services = {};
    this.resolves = [];
    this.inherit = undefined;
    this.handler = undefined;
  }
}
