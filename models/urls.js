var mongoose = require('mongoose')
  Schema = mongoose.Schema;
   urlSchema = new mongoose.Schema({
         url: { 'type': String ,'default': ''}
       , body: { 'type': String ,'default': ''}
       , url: { 'type': String, 'default': '' }
       , title: { 'type': String ,'default': ''}
       , favicon: { 'type': String ,'default': ''}
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
