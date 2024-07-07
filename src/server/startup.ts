import http, { Server } from 'http';

import verifyConfig, { IAppConfig, IMaybeAppConfig } from '@epiijs/config';

import { buildLogging } from './logging.js';
import { buildContext } from './runtime.js';
import { mountRouting } from './routing.js';
import { mountService } from './service.js';

interface IContextForStartup {
  getAppConfig: () => IAppConfig;
}

interface IStartupResult {
  httpServer: Server;
}

export async function startServer(config: IMaybeAppConfig): Promise<IStartupResult> {
  const verifiedConfig = verifyConfig(config);
  const logging = buildLogging(verifiedConfig);

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
      // TODO: wrap read only
      return verifiedConfig;
    }, undefined);

    const sessionInjector = spawnInjector(processInjector, context);

    handleRequest(request, response, context).catch(error => {
      // TODO: logging.error
      console.error(error);
    }).finally(() => {
      sessionInjector.dispose();
      context.dispose();
    });
  });

  httpServer.on('close', () => {
    processInjector.dispose();
    disposeRouter();
    logging('server closed');
  });

  const serverPort = verifiedConfig.port.server;
  httpServer.listen(serverPort, () => {
    logging(`server started on port ${serverPort}`);
  });

  return {
    httpServer
  };
}

export type {
  IContextForStartup,
  IStartupResult
};
