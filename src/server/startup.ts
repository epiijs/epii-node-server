import http, { Server } from 'http';

import verifyConfig, { IAppConfig, IMaybeAppConfig } from '@epiijs/config';

import { mountRouting } from './routing.js';
import { mountService } from './service.js';
import { buildContext, getVerboseOutput } from './runtime.js';

interface IContextForStartup {
  getAppConfig: () => IAppConfig;
  getAppLogger: (...args: unknown[]) => void;
}

interface IStartupResult {
  httpServer: Server;
}

export async function startServer(config: IMaybeAppConfig): Promise<IStartupResult> {
  const verifiedConfig = verifyConfig(config);
  const verbose = getVerboseOutput(verifiedConfig);

  const {
    handleRequest,
    disposeRouter
  } = await mountRouting(verifiedConfig);
  const {
    spawnInjector
  } = await mountService(verifiedConfig);
  
  const processInjector = spawnInjector();

  const httpServer = http.createServer((request, response) => {
    const context = buildContext();

    context.install('getAppConfig', () => {
      return verifiedConfig;
    }, undefined);

    context.install('getAppLogger', verbose, undefined);

    const sessionInjector = spawnInjector(processInjector, context);

    handleRequest(request, response, context).catch(error => {
      console.error(error);
    }).finally(() => {
      sessionInjector.dispose();
      context.dispose();
    });
  });

  httpServer.on('close', () => {
    processInjector.dispose();
    disposeRouter();
    verbose('server closed');
  });

  const serverPort = verifiedConfig.port.server;
  httpServer.listen(serverPort, () => {
    verbose(`server started on port ${serverPort}`);
  });

  return {
    httpServer
  };
}

export type {
  IContextForStartup,
  IStartupResult
};
