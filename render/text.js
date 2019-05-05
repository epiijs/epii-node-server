module.exports = {
  /**
   * process text
   *
   * @param  {Object} result
   */
  solve: async function (result) {
    var model = result.model
    this.set('content-type', 'text/plain')
    this.body = model.toString()
  },

  /**
   * get text result
   *
   * @param  {String=} model
   * @return {Object} text result
   */
  order: function (model) {
    return {
      type: 'text',
      model: model
    }
  }
}
