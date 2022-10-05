import { createReadStream, ReadStream } from 'fs';

import { Context } from 'koa';
import { contentType } from 'mime-types';

import { IActionResult, IRender } from '../types';

export interface IFileActionResult extends IActionResult {
  mode: 'file' | 'play';
  file: string | ReadStream;
}

const fileRender: IRender = {
  createActionResult: (file: string | ReadStream, mode = 'file'): IFileActionResult => {
    return { type: 'file', file, mode };
  },

  outputActionResult: async (ctx: Context, result: IActionResult): Promise<void> => {
    const { mode, file } = result as IFileActionResult;
    if (mode === 'file') {
      ctx.set('content-type', 'application/octet-stream');
    }
    if (typeof file === 'string') {
      if (mode === 'play') {
        ctx.set('content-type', contentType(file) || 'application/octet-stream');
        ctx.set('access-control-allow-origin', '*');
        ctx.set('timing-allow-origin', '*');
      }
      ctx.body = createReadStream(file);
    } else if (file instanceof ReadStream) {
      ctx.body = file;
    } else {
      throw new Error('file result only accept string or ReadStream');
    }  
  }
}

export default fileRender;
