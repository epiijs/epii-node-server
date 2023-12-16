import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';

import { ActionResult, HandlerFn } from '../server/handler.js';

interface IHandlerOptionsForStaticFiles {
  fileName?: string;
  fileRoot?: string;
  filePath?: string;
  contentType?: string;
  onDispose?: () => void;
}

function createHandlerForStaticFiles(options: IHandlerOptionsForStaticFiles): HandlerFn {
  // TODO: replace throw error with http response status code error

  const handlerFn: HandlerFn = async (dispose): Promise<ActionResult> => {
    let filePath = '';
    if (options.filePath) {
      filePath = options.filePath;
    } else if (options.fileRoot && options.fileName) {
      filePath = path.join(options.fileRoot, options.fileName);
    }
    if (!filePath) {
      throw new Error('file name & file root required');
    }
    if (options.fileRoot && !filePath.startsWith(options.fileRoot)) {
      throw new Error('unsafe file access denied');
    }

    const contentType = options.contentType || mime.contentType(path.extname(filePath)) || 'application/octet-stream';
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // TODO: createReadStream if file size is large than ?

    dispose(() => {
      options.onDispose?.();
    });

    if (fileContent) {
      return {
        status: 200,
        headers: {
          'content-type': contentType
        },
        content: fileContent
      };
    }
  };

  return handlerFn;
}

export default createHandlerForStaticFiles;

export type {
  IHandlerOptionsForStaticFiles
};