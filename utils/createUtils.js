var mongoose = require('mongoose')
    , urlModel = mongoose.model('url')
    , blockModel = mongoose.model('block');

exports.url=function(url, cb){
    var urlObj;
    urlParseObj=parseURI(url);
    parsedURL=urlParseObj.domain+urlParseObj.path.replace(/\/$/g, '');
    urlModel.findOne({url:parsedURL}, function(err, responseURL){
      if (err){ cb(err, null); return false} 
      cb(null, responseURL);   
    });
}

exports.block=function(block, user, cb){
  blockModel.findOne({_id:block}, function(err, result){ 
   if (err){ cb(err, null); return}; 
      var blockNew

      if (result)
        cb(null, result);
      else
      blockNew=new blockModel({user:user.id}),
      blockNew.save(function(){
        cb(null, blockNew);
      });
    });
}

//req.user.username



  function parseURI(sourceUri){
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"],
      uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri),
      uri = {};
    
    for(var i = 0; i < 10; i++){
      uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }
    
    /* Always end directoryPath with a trailing backslash if a path was present in the source URI
    Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key */
    if(uri.directoryPath.length > 0){
      uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }
    
    return uri;
  };