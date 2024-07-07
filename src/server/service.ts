import path from 'path';

import { glob } from 'glob';
import { IAppConfig } from '@epiijs/config';
import { IInjector, ServiceFactoryFn, ServiceLocator, createInjector } from '@epiijs/inject';

import { importModule } from './require.js';
import { IContextInner } from './runtime.js';

enum EServiceScope {
  Process = 'Process',
  Session = 'Session'
}

interface IRefService {
  default: ServiceFactoryFn;
  options: {
    name: string;
    scope: EServiceScope;
  };
}

type ServiceDeclareResult = IRefService['options'];
type ServiceDeclareFn = () => ServiceDeclareResult;

async function loadServiceModule({ dirName, fileName }: {
  dirName: string;
  fileName: string;
}): Promise<IRefService | undefined> {
  interface IServiceModule {
    default: unknown;
    declare?: () => IRefService['options'];
  }
  const relativePath = path.relative(dirName, fileName);
  const {
    default: maybeServiceFn,
    declare
  } = await importModule(fileName) as IServiceModule;
  const serviceFn: ServiceFactoryFn = (services: ServiceLocator): unknown => {
    return typeof maybeServiceFn === 'function'
      ? maybeServiceFn(services)
      : maybeServiceFn;
  };
  const serviceOptions = typeof declare === 'function' ? declare() : undefined;
  const defaultName = relativePath.replace(/\/?index\.js$/, '');
  const refService: IRefService = {
    default: serviceFn,
    options: {
      name: defaultName,
      scope: EServiceScope.Process,
      ...serviceOptions
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

interface IHookBind {
  services: ServiceLocator;
}

function useService({ services }: IHookBind, name: string): unknown {
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
        context?.install<IHookBind>('useService', useService, { services: injector.service() as ServiceLocator });
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
  ServiceDeclareResult,
  ServiceDeclareFn,
  ServiceLocator,
  IContextForService
};
