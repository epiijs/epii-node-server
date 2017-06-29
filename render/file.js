'use strict'

const fs = require('fs')

module.exports = {
  /**
   * process file
   *
   * @param  {Object} result
   */
  solve: async function (result) {
    this.set('content-type', 'application/octet-stream')
    this.body = fs.createReadStream(result.file)
  },

  /**
   * get file result
   *
   * @param  {String=} file - file name
   * @return {Object} file result
   */
  order: function (file) {
    return {
      type: 'file',
      file: file
    }
  }
}
