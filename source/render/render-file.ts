import fs, { ReadStream } from 'fs';
import path from 'path';
import { Context } from 'koa';
import mime from 'mime';
import { IActionResult } from '../kernel/define';

function getContentType(file) {
  let type = mime.getType(path.extname(file)) || 'application/octet-stream';
  if (type === 'text/plain') {
    type += '; charset=utf-8';
  }
  return type;
}

interface IFileActionResult extends IActionResult {
  mode: 'file' | 'play';
  file: string | ReadStream;
}

export async function renderFile(ctx: Context, result: IFileActionResult) {
  if (result.mode === 'file') {
    ctx.set('content-type', 'application/octet-stream');
  }
  if (typeof result.file === 'string') {
    if (result.mode === 'play') {
      ctx.set('content-type', getContentType(result.file));
      ctx.set('access-control-allow-origin', '*');
      ctx.set('timing-allow-origin', '*');
    }
    ctx.body = fs.createReadStream(result.file);
  } else if (result.file instanceof fs.ReadStream) {
    ctx.body = result.file;
  } else {
    throw new Error('file result only accept string or ReadStream');
  }
}

/**
 * get file result
 *
 * @param  {String||fs.ReadStream} file - file name or stream
 * @param  {String} mode - file | play
 * @return {Object} file result
 */
export function orderActionResult(file, mode = 'file') {
  return {
    type: 'file',
    file,
    mode
  };
}

export default {
  
}