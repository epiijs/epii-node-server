/* eslint-disable global-require */

const fs = require('fs');
const path = require('path');
const assist = require('./assist');
const logger = require('./logger');

const watchers = {};

/**
 * get sub files of directory
 *
 * @param {String} dir
 * @return {Promise<String[]>} files
 */
function getSubFiles(dir) {
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
 *
 * @param  {String} file - path for module
 * @param  {Function} callback - fn(error, module, file)
 * @return {Object} module
 */
function loadFile(file, callback) {
  // verify *.js
  if (!/\.js$/.test(file)) return null;

  // try to (re)load module
  let o = null;
  let error = null;
  try {
    delete require.cache[require.resolve(file)];
    o = require(file);
  } catch (e) {
    logger.halt('failed to load', file);
    logger.halt(e.message);
    error = e;
  }
  if (callback) callback(error, o, file);
  return o;
}

/**
 * auto load directory
 *
 * @param  {String} name - watcher name
 * @param  {String} dir - path for modules
 * @param  {Function} callback - fn(error, module)
 * @return {Object}
 */
function autoLoadDir(name, dir, callback) {
  // todo - why so many callback invoked
  // watcher already cached
  if (watchers[name]) return watchers[name];

  // create fs watcher
  const watcher = assist.tryWatch(dir, (e, file) => {
    logger.warn(`[${name}] ${e} ${path.relative(dir, file)}`);
    if (e === 'add' || e === 'change') {
      loadFile(file, callback);
    }
  });

  // cache fs watcher
  watchers[name] = watcher;
  return watcher;
}

module.exports = {
  loadFile,
  autoLoadDir,
  getSubFiles
};
