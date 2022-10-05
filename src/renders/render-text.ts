import { Context } from 'koa';

import { IActionResult, IRender } from '../types';

export interface ITextActionResult extends IActionResult {
  data: any;
}

const textRender: IRender = {
  createActionResult: (data: any): ITextActionResult => {
    return { type: 'text', data };
  },

  outputActionResult: async (ctx: Context, result: IActionResult): Promise<void> => {
    const { data } = result as ITextActionResult;
    ctx.set('content-type', 'text/plain; charset=utf-8');
    ctx.body = data.toString();
  }
}

export default textRender;
