import Koa from 'koa';
import { IContainer } from './kernel/inject';

export interface IApp extends Koa {
  epii: IContainer;
}

export interface IServerOptions {
  name: string;
  port: number;

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
