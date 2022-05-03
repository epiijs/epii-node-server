import { Context } from 'koa';

import { IActionResult, IRender } from '../kernel/render';

export interface IJsonActionResult extends IActionResult {
  data: any;
}

const jsonRender: IRender = {
  createActionResult: (data: any): IJsonActionResult => {
    return { type: 'json', data };
  },

  outputActionResult: async (ctx: Context, result: IActionResult): Promise<void> => {
    const { data } = result as IJsonActionResult;
    ctx.set('content-type', 'application/json; charset=utf-8');
    ctx.body = data || null;
  }
}

export default jsonRender;
