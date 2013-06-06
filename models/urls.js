var mongoose = require('mongoose')
  Schema = mongoose.Schema;
   urlSchema = new mongoose.Schema({
         url: { 'type': String ,'default': ''}
       , body: { 'type': String ,'default': ''}
  });

   bookmarkSchema.statics = {
  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api public
   */
  findOne: function (url, cb) {
    this.findOne({ url : url })
    .exec(cb)
  },
  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'username')
      .exec(cb)
  }
}

module.exports = mongoose.model('url', urlSchema);
