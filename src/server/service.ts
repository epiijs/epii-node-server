import path from 'path';

import { glob } from 'glob';
import { IAppConfig } from '@epiijs/config';
import { IInjector, ServiceFactoryFn, ServiceLocator, createInjector } from '@epiijs/inject';

import { IContextInner } from './context.js';
import { importModule } from './resolve.js';

enum EServiceScope {
  Process = 'Process',
  Session = 'Session'
}

interface IServiceOptions {
  name: string;
  scope: EServiceScope;
}

interface IRefService {
  default: ServiceFactoryFn;
  options: IServiceOptions;
}

async function loadServiceModule({ dirName, fileName }: {
  dirName: string;
  fileName: string;
}): Promise<IRefService | undefined> {
  interface IServiceModule {
    default: unknown;
    registerService?: () => IServiceOptions;
  }
  const relativePath = path.relative(dirName, fileName);
  const {
    default: maybeServiceFn,
    registerService
  } = await importModule(fileName) as IServiceModule;
  const serviceFn: ServiceFactoryFn = (services: ServiceLocator): unknown => {
    return typeof maybeServiceFn === 'function'
      ? maybeServiceFn(services)
      : maybeServiceFn;
  };
  if (registerService && typeof registerService === 'function') {
    // TODO: const serviceOptions = registerAction();
  }
  const defaultName = relativePath.replace(/\/?index\.js$/, '');
  const refService: IRefService = {
    default: serviceFn,
    options: {
      name: defaultName,
      scope: EServiceScope.Process
      // ...serviceOptions
    }
  };
  return refService;
}

async function findAllServices(config: IAppConfig): Promise<IRefService[]> {
  const serviceDir = path.join(config.root, config.dirs.target, config.dirs.server, 'services');
  const serviceFilePattern = `${serviceDir}/**/index.js`;
  const serviceFileNames = await glob(serviceFilePattern);
  const services: IRefService[] = [];
  for (const serviceFileName of serviceFileNames) {
    const service = await loadServiceModule({
      dirName: serviceDir,
      fileName: serviceFileName
    });
    if (service) {
      services.push(service);
    }
  }
  // TODO: watch & load new actions
  return services;
}

interface IHookSelf {
  services: ServiceLocator;
}

function useService({ services }: IHookSelf, name: string): unknown {
  return services[name];
}

interface IContextForService {
  useService: <T = unknown>(name: string) => T;
}

interface IServiceRegistry {
  spawnInjector: (inherit?: IInjector, context?: IContextInner) => IInjector;
}

export async function mountService(config: IAppConfig): Promise<IServiceRegistry> {
  const services = await findAllServices(config);
  const servicesForProcess = services.filter(service => service.options.scope === EServiceScope.Process);
  const servicesForSession = services.filter(service => service.options.scope === EServiceScope.Session);
  return {
    spawnInjector: (inherit, context) => {
      const injector = createInjector();
      if (inherit) {
        injector.inherit(inherit);
        servicesForSession.forEach(service => {
          injector.provide(service.options.name, service.default);
        });
        context?.install<IHookSelf>('useService', useService, { services: injector.service() as ServiceLocator });
      } else {
        servicesForProcess.forEach(service => {
          injector.provide(service.options.name, service.default);
        });
      }
      return injector;
    }
  };
}

export type {
  ServiceFactoryFn,
  ServiceLocator,
  IServiceOptions,
  IContextForService
};
