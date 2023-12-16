import http from 'http';
import path from 'path';

import createFindMyWayRouter, { HTTPVersion, Handler } from 'find-my-way';
import { glob } from 'glob';

import { IAppConfig } from '@epiijs/config';

import { ActionFnInner, performAction } from './handler.js';
import { IOutgoingMessage, buildIncomingMessage, buildOutgoingMessage } from './message.js';
import { importModule } from './resolve.js';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface IRoute {
  method: HTTPMethod;
  path: string;
}

interface IRefAction {
  default: ActionFnInner;
  options: {
    routes: IRoute[];
  };
}

async function loadActionModule({ dirName, fileName }: {
  dirName: string;
  fileName: string;
}): Promise<IRefAction | undefined> {
  interface IActionModule {
    default: ActionFnInner;
    registerAction?: () => IRoute[];
  }
  const relativePath = path.relative(dirName, fileName);
  const actionModule = await importModule(fileName) as IActionModule;
  const {
    default: maybeActionFn,
    registerAction
  } = actionModule;
  if (typeof maybeActionFn !== 'function') {
    console.log(`error: action.default should be function at ${relativePath}`);
    return;
  }
  if (registerAction && typeof registerAction === 'function') {
    // TODO: const actionOptions = registerAction();
  }
  const defaultPath = '/' + relativePath.replace(/\/?index\.js$/, '');
  const routePath = defaultPath.replace(/\$/g, ':');
  const refAction: IRefAction = {
    default: maybeActionFn,
    options: {
      routes: [
        { method: 'GET', path: routePath }
      ]
    }
  };
  return refAction;
}

async function findAllActions(config: IAppConfig): Promise<IRefAction[]> {
  const actionDir = path.join(config.root, config.dirs.target, config.dirs.server, 'actions');
  const actionFilePattern = `${actionDir}/**/index.js`;
  const actionFileNames = await glob(actionFilePattern);
  const actions: IRefAction[] = [];
  for (const actionFileName of actionFileNames) {
    const action = await loadActionModule({
      dirName: actionDir,
      fileName: actionFileName
    });
    if (action) {
      actions.push(action);
    }
  }
  // TODO: watch & load new actions
  return actions;
}

interface IRouter {
  handleRequest: (request: http.IncomingMessage, response: http.ServerResponse, context: unknown) => Promise<void>;
  disposeRouter: () => void;
}

export async function mountRouting(config: IAppConfig): Promise<IRouter> {
  const router = createFindMyWayRouter({
    ignoreTrailingSlash: true
  });
  const actions = await findAllActions(config);
  actions.forEach(action => {
    const routeFn: Handler<HTTPVersion.V1> = async (request, response, params, context) => {
      const incomingMessage = buildIncomingMessage(request, params);
      const outgoingMessage = await performAction(action.default, incomingMessage, context);
      return outgoingMessage;
    };
    const { routes } = action.options;
    routes.forEach(route => {
      router.on(route.method, route.path, routeFn);
    });
  });

  return {
    handleRequest: async (request, response, context): Promise<void> => {
      if (!request.url) { request.url = '/'; }
      let outgoingMessage: IOutgoingMessage;
      const findResult = router.find(request.method as HTTPMethod, request.url);
      // TODO: support custom error builder
      if (findResult) {
        const { handler, params } = findResult;
        try {
          // TODO: find out why find-my-way requires search-params
          outgoingMessage = await handler(request, response, params, context, {}) as IOutgoingMessage;
        } catch (error) {
          console.error(error);
          outgoingMessage = buildOutgoingMessage({
            status: 500,
            content: 'internal server error'
          });
        }
      } else {
        outgoingMessage = buildOutgoingMessage({
          status: 404,
          content: 'not found'
        });
      }

      return new Promise((resolve, reject) => {
        response.on('error', reject);
        response.on('finish', resolve);
        response.writeHead(outgoingMessage.status, outgoingMessage.headers);
        response.end(outgoingMessage.content);
      });
    },

    disposeRouter: () => {
      router.reset();
    }
  };
}

export type {
  HTTPMethod,
  IRouter
};
