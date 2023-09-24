import { IAppConfig } from '@epiijs/config';

import { HTTPMethod } from './server/routing';
import { IncomingMessage, OutgoingMessage } from './server/message';
import { ActionResult, ActionFnInner, HandlerFn, HandlerDisposeFn, IContextForHandler } from './server/handler';
import { ServiceFactoryFn, IContextForService } from './server/service';
import { startServer } from './server/startup';

export {
  startServer
};

type Context = IContextForHandler & IContextForService;
type ActionFn = ActionFnInner<Context>;

export type {
  IAppConfig,
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
