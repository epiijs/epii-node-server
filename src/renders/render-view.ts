import * as path from 'path';

import { Context } from 'koa';

import HTML5 = require('@epiijs/html5');
// TODO - change to use portal

import { IActionResult, IRender } from '../kernel/render';
import { IInjector } from '../kernel/inject';
import { IServerConfig } from '../server';

const CONTEXT = {
  viewPack: null,
};

export interface IViewActionResult extends IActionResult {
  name: string;
  data: any;
}

const viewRender: IRender = {
  createActionResult: (name: string, data: any): IViewActionResult => {
    return { type: 'view', name, data };
  },

  outputActionResult: async (ctx: Context, result: IActionResult): Promise<void> => {
    const { name, data } = result as IViewActionResult;

    // get app config
    const sessionInjector = ctx.epii as IInjector;
    const config = sessionInjector.getService('config') as IServerConfig;

    const resolver = (name: string) => {
      return path.join(config.path.root, config.path.server.portal, name);
    };

    // get or init view cache
    let viewPack: any = CONTEXT.viewPack;
    if (!viewPack) {
      viewPack = new HTML5.ViewPack(resolver);
      viewPack.useLoader(
        HTML5.FileLoader,
        {
          prefix: config.static.prefix,
          source: path.join(config.path.root, config.path.static)
        }
      );
      CONTEXT.viewPack = viewPack;
    }

    // lazy load client meta
    let viewMeta = viewPack.getViewMeta(name);
    if (!viewMeta || ctx.app.env === 'development') {
      const viewPath = path.join(name, 'index.meta.js');
      viewMeta = viewPack.loadViewMeta(viewPath);
    }

    // mount view with model
    await viewMeta.mount(viewPack.loaders, data);

    // render view into html
    ctx.body = HTML5.renderToString(viewMeta);
    ctx.set('content-type', 'text/html; charset=utf-8');
  }
}

export default viewRender;
