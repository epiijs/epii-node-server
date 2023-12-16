import { IMaybeAppConfig } from '@epiijs/config';

import { HTTPMethod } from './server/routing.js';
import { IncomingMessage, OutgoingMessage } from './server/message.js';
import { ActionResult, ActionFnInner, HandlerFn, HandlerDisposeFn, IContextForHandler } from './server/handler.js';
import { ServiceFactoryFn, IContextForService } from './server/service.js';
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
  Context,
  HandlerDisposeFn,
  HandlerFn,
  ServiceFactoryFn,

  IncomingMessage,
  OutgoingMessage
};
