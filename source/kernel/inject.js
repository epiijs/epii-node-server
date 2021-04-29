/* eslint-disable no-continue */

const path = require('path');
const loader = require('./loader');
const logger = require('./logger');

function concatPath(root, name) {
  if (typeof root === 'function') {
    return root(name);
  }
  return path.join(root, name);
}

class Container {
  constructor() {
    this.ancestor = null;
    this.services = {}; // { key: { service, ...options } }
    this.requires = [];
    this.destruct = [];
    this.entrance = null;
  }

  provide(name, service, options = {}) {
    if (!name || !service) return;
    const dep = this.services[name];
    if (dep && !dep.writable) return;
    this.services[name] = {
      service,
      writable: options.writable != null ? options.writable : true,
      evaluable: options.evaluable != null ? options.evaluable : true,
    };
    if (options.destructurable) {
      if (this.destruct.indexOf(name) < 0) {
        this.destruct.push(name);
      }
    }
  }

  require(name) {
    if (!name) return;
    if (this.requires.indexOf(name) < 0) {
      this.requires.push(name);
    }
  }

  inherit() {
    const container = new Container();
    container.ancestor = this;
    return container;
  }

  service(name) {
    // 0. proxy service(name)
    if (!name) {
      if (!this.entrance) {
        this.entrance = new Proxy({}, {
          get: (target, property) => this.service.call(this, property),
        });
      }
      return this.entrance;
    }

    // 1. get service directly
    if (name in this.services) {
      const dep = this.services[name];
      if (dep.evaluable && typeof dep.service === 'function') {
        return dep.service(this.service());
      }
      return dep.service;
    }

    // 2. destructure service
    for (let i = 0; i < this.destruct.length; i += 1) {
      const dep = this.service(this.destruct[i]);
      if (name in dep) {
        return dep[name];
      }
    }

    // 3. get service of ancestor
    if (this.ancestor) {
      return this.ancestor.service(name);
    }

    // 4. load external service
    for (let i = 0; i < this.requires.length; i += 1) {
      const depPath = concatPath(this.requires[i], name + '.js');
      if (!depPath) continue;
      const dep = loader.loadFile(depPath);
      if (dep != null) {
        this.provide(name, dep);
        return this.service(name);
      }
    }

    // 5. service not found
    logger.warn(`service [${name}] not found`);
    return null;
  }
}

module.exports = {
  Container,
};
