module.exports = {
  /**
   * process json
   *
   * @param  {Object} result
   */
  solve: async (ctx, result) => {
    ctx.set('content-type', 'application/json');
    ctx.body = result.data || {};
  },

  /**
   * get json result
   *
   * @param  {Object} data
   * @return {Object} json result
   */
  order: (data) => {
    return {
      type: 'json',
      data
    };
  }
};
