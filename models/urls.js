var mongoose = require('mongoose')
  Schema = mongoose.Schema;
   urlSchema = new mongoose.Schema({
         url: { 'type': String ,'default': ''}
       , body: { 'type': String ,'default': ''}
       , url: { 'type': String, 'default': '' }
       , title: { 'type': String ,'default': ''}
       , favicon: { 'type': String ,'default': ''}
       , totalBookmarks: { 'type': Number, 'default': 1 }
  });


   bookmarkSchema.statics = {
  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api public
   */
}

module.exports = mongoose.model('url', urlSchema);
