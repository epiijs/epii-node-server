import Koa, { Context, Next } from 'koa';

import { IInjector, IServiceHandler } from '@epiijs/inject';

export interface IApp extends Koa {
  epii: IInjector;
}

export interface IServerConfig {
  name: string;
  port: number;
  root: string;
  path: {
    service: string;
    middleware: string;
    controller: string;
    portal: string;
    static: string;
  };
  loader: {
    reload: boolean;
    middleware: string[];
  };
  static: {
    prefix: string;
    expose: string[];
  }
}

export interface IActionResult {
  type: string;
}

export type OutputActionResultFn = (ctx: Context, result: IActionResult) => Promise<void>;
export type CreateActionResultFn = (...args: any) => IActionResult;

export interface IRender {
  createActionResult: CreateActionResultFn;
  outputActionResult: OutputActionResultFn;
}

export type MiddleFn = (services: IServiceHandler, next: Next) => Promise<void>;

export type ActionFn = (services: IServiceHandler) => Promise<IActionResult>;
