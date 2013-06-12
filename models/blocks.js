var mongoose = require('mongoose')
  Schema = mongoose.Schema;
   blockSchema = new mongoose.Schema({
    title: { 'type': String, 'default': "add title here..." }
  });

   blockSchema.statics = {
  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api public
   */
  load: function (id, cb) {
    this.findOne({ _id : id })
      .exec(cb)
  }
}

module.exports = mongoose.model('block',  blockSchema);