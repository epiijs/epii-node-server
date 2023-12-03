import http from 'http';

import verifyConfig, { IMaybeAppConfig } from '@epiijs/config';

import { mountRouting } from './routing';
import { mountService } from './service';
import { buildContext } from './context';

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
    const sessionInjector = spawnInjector(processInjector, context);
    handleRequest(request, response, context).finally(() => {
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
