var mongoose = require('mongoose')
  Schema = mongoose.Schema;
   bookmarkSchema = new mongoose.Schema({
         urlObj: { type : Schema.ObjectId, ref : 'url', 'default': null }
       , url: { 'type': String, 'default': '' }
       , location: { 'type': String, 'default': '' }
       , body: { 'type': String, 'default': 'empty post...' }
       , createdAt : {type : Date, default : Date.now}
       , user  : { type : Schema.ObjectId, ref : 'User' } 
       , title: { 'type': String ,'default': ''}
       , block: { 'type': String ,'default': ''}
       , favicon: { 'type': String ,'default': ''}
       , block  : { type : Schema.ObjectId, ref : 'block', 'default': null } 
  });

   bookmarkSchema.statics = {
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

module.exports = mongoose.model('bookmark', bookmarkSchema);