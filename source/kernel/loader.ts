/* eslint-disable global-require */

import fs, { FSWatcher } from 'fs';
import path from 'path';
import logger from './logger';

type CallbackForTryWatch = (event: string, path: string) => void;
type CallbackForLoadModule = (error: Error, module: any, file: string) => void;

const watchers = {} as { [key in string]: FSWatcher };

/**
 * get sub files of directory
 */
export function getSubFiles(dir: string): Promise<string[]> {
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

/**
 * load module from file
 */
export function loadModule(file: string, callback?: CallbackForLoadModule): any {
  // verify *.js
  if (!/\.js$/.test(file)) return null;

  // try to (re)load module
  let o = null;
  let error = null;
  try {
    delete require.cache[require.resolve(file)];
    o = require(file);
  } catch (e) {
    logger.fail('failed to load', file);
    logger.fail(e.message);
    error = e;
  }
  if (callback) callback(error, o, file);
  return o;
}

/**
 * watch target with custom callback
 */
function tryWatch(target: string, callback: CallbackForTryWatch): FSWatcher {
  const chokidar = require('chokidar');
  return chokidar
    .watch(target, {
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false
    })
    .on('all', callback);
}

/**
 * auto load all modules of directory
 */
export function autoLoadDir(name: string, dir: string, callback: CallbackForLoadModule): FSWatcher {
  if (watchers[name]) return watchers[name];
  // TODO - support unlink
  const watcher = tryWatch(dir, (event, file) => {
    logger.warn(`[${name}] ${event} ${path.relative(dir, file)}`);
    if (event === 'add' || event === 'change') {
      loadModule(file, callback);
    }
  });
  watchers[name] = watcher;
  return watcher;
}

export default {
  loadModule,
  autoLoadDir,
  getSubFiles
};
