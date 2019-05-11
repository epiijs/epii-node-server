const fs = require('fs');

module.exports = {
  /**
   * process file
   *
   * @param  {Object} result
   */
  solve: async (ctx, result) => {
    ctx.set('content-type', 'application/octet-stream');
    ctx.body = fs.createReadStream(result.file);
  },

  /**
   * get file result
   *
   * @param  {String=} file - file name
   * @return {Object} file result
   */
  order: (file) => {
    return {
      type: 'file',
      file
    };
  }
};
