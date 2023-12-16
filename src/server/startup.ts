import http from 'http';

import verifyConfig, { IAppConfig, IMaybeAppConfig } from '@epiijs/config';

import { mountRouting } from './routing.js';
import { mountService } from './service.js';
import { buildContext } from './context.js';

interface IContextForStartup {
  getAppConfig: () => IAppConfig;
}

export async function startServer(config: IMaybeAppConfig): Promise<void> {
  const verifiedConfig = verifyConfig(config);

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

    const sessionInjector = spawnInjector(processInjector, context);

    handleRequest(request, response, context).catch(error => {
      // TODO: log kernel error
      console.error(error);
    }).finally(() => {
      sessionInjector.dispose();
      context.dispose();
    });
  });

  httpServer.on('close', () => {
    processInjector.dispose();
    disposeRouter();
    console.log('server closed');
  });

  const serverPort = verifiedConfig.port.server;
  httpServer.listen(serverPort, () => {
    console.log(`server started on port ${serverPort}`);
  });
}

export type {
  IContextForStartup
};
