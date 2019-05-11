module.exports = {
  /**
   * process json
   *
   * @param  {Object} result
   */
  solve: async (ctx, result) => {
    ctx.set('content-type', 'application/json');
    ctx.body = result.model || {};
  },

  /**
   * get json result
   *
   * @param  {Object=} model
   * @return {Object} json result
   */
  order: (model) => {
    return {
      type: 'json',
      model
    };
  }
};
