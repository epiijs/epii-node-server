import { Context } from 'koa';

import { IActionResult, IRender } from '../kernel/render';

export interface IJumpActionResult extends IActionResult {
  mode: 'http' | 'html';
  path: string;
}

const jumpRender: IRender = {
  createActionResult: (path: string, mode: 'http' | 'html' = 'http'): IJumpActionResult => {
    return { type: 'jump', path, mode };
  },

  outputActionResult: async (ctx: Context, result: IActionResult): Promise<void> => {
    const { mode, path } = result as IJumpActionResult;
    if (mode === 'http') {
      ctx.redirect(path);
    } else {
      ctx.set('content-type', 'text/html');
      ctx.body = `<script>setTimeout(function(){location.href='${path}'}, 0)</script>`;
    }
  }
}

export default jumpRender;
