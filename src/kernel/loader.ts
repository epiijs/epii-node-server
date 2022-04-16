/* eslint-disable global-require */

import fs, { FSWatcher } from 'fs';
import { relative } from 'path';
import logger from './logger';

type TryWatchFn = (event: string, path: string) => void;
type LoadModuleFn = (error: Error, module: any, path: string) => void;

const watchers = {} as { [key in string]: FSWatcher };

function getFilesInDir(dir: string): Promise<string[]> {
  return new Promise((resolve) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        console.error(error);
        resolve([]);
      } else {
        resolve(files);
      }
    });
  });
}

function createWatcher(target: string, callback: TryWatchFn): FSWatcher {
  const chokidar = require('chokidar');
  return chokidar
    .watch(target, {
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false
    })
    .on('all', callback);
}

function watchFilesInDir(name: string, dir: string, callback: TryWatchFn): FSWatcher {
  if (watchers[name]) {
    return watchers[name];
  }
  const watcher = createWatcher(dir, (event, path) => {
    const file = relative(dir, path);
    logger.warn(`[${name}] ${event} ${file}`);
    callback(event, path);
  });
  watchers[name] = watcher;
  return watcher;
}

function loadModule(path: string, callback?: LoadModuleFn): any {
  // verify *.js
  if (!/\.js$/.test(path)) {
    return null;
  }

  // try to (re)load module
  let o = null;
  let error = null;

  try {
    delete require.cache[require.resolve(path)];
    o = require(path);
  } catch (e) {
    logger.error('failed to load', path);
    logger.error(e.message);
    error = e;
  }
  if (callback) {
    callback(error, o, path);
  }
  return o;
}

export default {
  getFilesInDir,
  watchFilesInDir,
  loadModule
};
