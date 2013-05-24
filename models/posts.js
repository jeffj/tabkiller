var mongoose = require('mongoose')
  Schema = mongoose.Schema;
   postsSchema = new mongoose.Schema({
         url: { 'type': String ,'default': ''}
       , location: { 'type': String, 'default': '' }
       , body: { 'type': String, 'default': 'empty post...' }
       , createdAt : {type : Date, default : Date.now}
       , user  : { type : Schema.ObjectId, ref : 'User' } 
  });

   postsSchema.statics = {
  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api public
   */
  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'username')
      .exec(cb)
  }
}

module.exports = mongoose.model('URL', postsSchema);