import { IMaybeAppConfig } from '@epiijs/config';

import { ActionDeclareResult } from './server/routing.js';
import { HTTPMethod, IncomingMessage, OutgoingMessage } from './server/message.js';
import { ActionResult, ActionFnInner, HandlerFn, HandlerDisposeFn, IContextForHandler } from './server/handler.js';
import { ServiceFactoryFn, ServiceDeclareResult, IContextForService } from './server/service.js';
import { IContextForStartup, startServer } from './server/startup.js';
import handlers from './handlers/index.js';

export {
  startServer,
  handlers
};

type Context = IContextForStartup & IContextForHandler & IContextForService;
type ActionFn = ActionFnInner<Context>;

export type {
  IMaybeAppConfig,
  HTTPMethod,

  ActionResult,
  ActionFn,
  ActionDeclareResult,
  Context,
  HandlerDisposeFn,
  HandlerFn,
  ServiceFactoryFn,
  ServiceDeclareResult,

  IncomingMessage,
  OutgoingMessage
};
