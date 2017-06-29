'use strict'

const fs = require('fs')
const path = require('path')
const assist = require('./assist')
const logger = require('./logger')

const watchers = {}

module.exports = {
  load: loadFiles,
  watch: watchDir
}

/**
 * load module from file
 *
 * @param  {String} file - path for module
 * @param  {Function} callback - fn(file, module)
 */
function loadFile(file, callback) {
  // verify *.js
  if (!/\.js$/.test(file)) return

  // try to load module
  try {
    delete require.cache[require.resolve(file)]
    var o = require(file)
    if (callback) callback(file, o)
  } catch (error) {
    logger.halt('failed to load', file)
    console.error(error.message)
  }
}

/**
 * load modules from path
 *
 * @param  {String} dir - path for modules
 * @param  {Function} callback - fn(file, module)
 */
function loadFiles(dir, callback) {
  var files = fs.readdirSync(dir)
  files.forEach(file => {
    var filePath = path.join(dir, file)
    loadFile(filePath, callback)
  })
}

/**
 * watch directory
 *
 * @param  {String} name - watcher name
 * @param  {String} dir - path for modules
 * @param  {Function} callback - fn(file, module)
 * @return {Object}
 */
function watchDir(name, dir, callback) {
  // watcher already cached
  if (watchers[name]) return watchers[name]

  // create fs watcher
  var watcher = assist.tryWatch(dir, (e, file) => {
    logger.warn(`[${name}] ${e} ${file}`)
    var filePath = path.join(dir, file)
    loadFile(filePath, callback)
  })

  // cache fs watcher
  watchers[name] = watcher
  return watcher
}
