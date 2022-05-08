/* eslint-disable global-require */

import { FSWatcher, readdir } from 'fs';
import logger from './logger';

type TryWatchFn = (event: string, path: string) => void;
type LoadModuleFn<T = unknown> = (error: Error, module: T, path: string) => void;

const CONTEXT: {
  watchers: FSWatcher[];
} = {
  watchers: []
};

export function listFilesOfDir(dir: string): Promise<string[]> {
  return new Promise((resolve) => {
    readdir(dir, (error, files) => {
      if (error) {
        logger.error(error);
        resolve([]);
      } else {
        resolve(files);
      }
    });
  });
}

export function watchTarget(target: string, callback: TryWatchFn): FSWatcher {
  const chokidar = require('chokidar');
  const watcher = chokidar
    .watch(target, {
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false
    })
    .on('all', callback);
  CONTEXT.watchers.push(watcher);
  return watcher;
}

function getWatchers(): FSWatcher[] {
  return CONTEXT.watchers;
}

export function loadModule<T = unknown>(path: string, callback?: LoadModuleFn<T>): T | undefined {
  // verify *.js
  if (!/\.js$/.test(path)) {
    return undefined;
  }
  // try to (re)load module
  let o: T | undefined = undefined;
  let error = null;
  try {
    delete require.cache[require.resolve(path)];
    o = require(path) as T;
  } catch (e: any) {
    logger.error('failed to load', path);
    logger.error(e.message);
    error = e;
  }
  if (callback && o) {
    callback(error, o, path);
  }
  return o;
}

export default {
  listFilesOfDir,
  watchTarget,
  getWatchers,
  loadModule
};
