'use strict'

module.exports = {
  /**
   * process json
   *
   * @param  {Object} result
   */
  solve: async function (result) {
    var model = result.model
    this.set('content-type', 'application/json')
    this.body = model || {}
  },

  /**
   * get json result
   *
   * @param  {Object=} model
   * @return {Object} json result
   */
  order: function (model) {
    return {
      type: 'json',
      model: model
    }
  }
}
