module.exports = {
  /**
   * process text
   *
   * @param  {Object} result
   */
  solve: async (ctx, result) => {
    ctx.set('content-type', 'text/plain');
    ctx.body = result.data.toString();
  },

  /**
   * get text result
   *
   * @param  {String=} data
   * @return {Object} text result
   */
  order: (data) => {
    return {
      type: 'text',
      data
    };
  }
};
