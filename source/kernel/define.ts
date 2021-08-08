import Koa from 'koa';
import { IContainer } from './inject';

export interface IConfig {
  name: string;
  path: {
    root: string;
    static: string;
    server: {
      controller: string;
      middleware: string;
      service: string;
    }
  },

  static: {
    prefix: string;
  },

  expert: {
    'well-known': false;
  }
}

export interface IApp extends Koa {
  epii: IContainer;
}

export interface IActionResult {
}

export type MiddleFn = (service: any, next: Koa.Next) => any;

export type ActionFn = (service: any) => IActionResult;
