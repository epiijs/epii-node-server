module.exports = {
  /**
   * process text
   *
   * @param  {Object} result
   */
  solve: async (ctx, result) => {
    ctx.set('content-type', 'text/plain');
    ctx.body = result.model.toString();
  },

  /**
   * get text result
   *
   * @param  {String=} model
   * @return {Object} text result
   */
  order: (model) => {
    return {
      type: 'text',
      model: model
    };
  }
};
