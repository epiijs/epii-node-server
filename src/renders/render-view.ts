import * as path from 'path';

import { Context } from 'koa';
import { Document, ILoader, FileLoader, renderToString } from '@epiijs/portal';

import { IInjector } from '../kernel/inject';
import { loadModule } from '../kernel/loader';
import { IActionResult, IRender } from '../kernel/render';
import { IServerConfig } from '../server';

const CONTEXT: {
  portals: Record<string, Document>,
  loaders: ILoader[]
} = {
  portals: {},
  loaders: []
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
    const sessionInjector = ctx.epii as IInjector;
    const config = sessionInjector.getService('config') as IServerConfig;
    const hotReload = config.expert['hot-reload'];

    if (CONTEXT.loaders.length === 0) {
      CONTEXT.loaders.push(new FileLoader({
        prefix: config.static.prefix,
        source: path.join(config.path.root, config.path.static)
      }));
    }

    const { name, data } = result as IViewActionResult;

    if (!CONTEXT.portals[name] || hotReload) {
      const file = path.join(config.path.root, config.path.server.document, `${name}.meta.js`);
      const meta = loadModule(file);
      CONTEXT.portals[name] = new Document(meta);
    }

    const portal = CONTEXT.portals[name];
    if (portal) {
      await portal.applyLoaders(CONTEXT.loaders);
      const document = portal.getInjectCopy(data);
      ctx.body = renderToString(document);
      ctx.set('content-type', 'text/html; charset=utf-8');
    }
  }
}

export default viewRender;
