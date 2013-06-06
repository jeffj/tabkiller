/**
 * Very basic CRUD route creation utility for models.
 * For validation, simply override the model's save method.
 */

(function (exports) {
  var parseUtils = require("./parseUtils.js")
    , mongoose = require('mongoose')
    , block = mongoose.model('block')
    , urlModel = mongoose.model('url');

  //console.log(parseUtils.parser)
  "use strict";
  function errMsg(msg) {
    return {'error': {'message': msg.toString()}};
  }
  //------------------------------
  // List
  //
  function getListController(model) {
    return function (req, res) {
      model
        .find({})
        .populate("user", "username")
        .sort("createdAt")
        .lean()
        .exec(function (err, result) {
        if (!err) {
          var json;
          json=parseResults(result, req.user); //adds a myPost key for the post the user ownes
          res.send(json);
        } else {
          res.send(errMsg(err));
        }
      });
    };
  }

  function parseResults(result, user){
  var id 
  if (user) id=user._id; //setting the id if it exists;
   for (var i = result.length - 1; i >= 0; i--) { 
      if(String(id)==result[i].user || String(id)==result[i].user._id)
        result[i].myPost=true;
      else
        result[i].myPost=false;
    };
    return result
  }


  function findURLObj(url, cb){
    urlParseObj=parseUri(url);
    parsedURL=urlParseObj.domain+urlParseObj.path.replace(/\/$/g, '');
    urlModel.findOne(parsedURL, function(err, responseURL){
      if (err) cb(err, null);   
      var urlObj;
      if (responseURL==null)
       urlObj = new urlModel({url:parsedURL}), urlObjCB=function(cb){ urlObj.save(cb(err))};
      else
       urlObj = responseURL, urlObjCB=function(cb){ cb(null) };

      urlObjCB(function(err){
        if(err) return err;
        cb(null, urlObj, urlParseObj.source);

      });



      
    });  
  }

  function parseUri(sourceUri){
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


  //------------------------------
  // Create
  //
  function getCreateController(model) {
    return function (req, res) {
      //console.log('create', req.user._id);
      var m = new model(req.body), blockObj, blockObjCB;
     
      m.user=req.user._id
      if (!m.block) blockObj=new block(), blockObjCB=function(cb){ blockObj.save(cb())};
      else blockObj=m.block, blockObjCB=function(cb){cb()};
      
      blockObjCB(function(err){
        m.block=blockObj;

        findURLObj(req.body.url, function(err, urlObj, sourceURL){

            // return
            console.log(urlObj)

            m["urlObj"]=urlObj;


            parseUtils.parser(sourceURL, function(err, respObj){


              m.title=respObj.title
              m.favicon=respObj.favicon

              m.save(function (err) {

                if (!err) {
                  var sender=m.toJSON()
                  sender.user={username:req.user.username}
                  res.send(sender);
                } else {

                  res.send(errMsg(err));
                }
              });
            });//parseUtils


          });//block save


        })//findURLObj

    };
  }

  //------------------------------
  // Read
  //
  function getReadController(model) {
    return function (req, res) {
      model.findById(req.params.id, function (err, result) {
        if (!err) {
          res.send(result);
        } else {
          res.send(errMsg(err));
        }
      });
    };
  }

  //------------------------------
  // Update
  //
  function getUpdateController(model) {
    return function (req, res) {
        var result=req.post, key;
        for (key in req.body) { //Update the keys
          if ("user"!=key)  //ignore the user key
          result[key] = req.body[key];
        }
        if (typeof result["url"]=="string")
          result.save(function (err) {
            if (!err) {
              var sender=result.toObject()
              if (req.user.username) sender.user={username:req.user.username};
              res.send(sender);
            } else {
              res.send(errMsg(err));
            }
          });
    };
  }
  //------------------------------
  // Delete
  //
  function getDeleteController(model) {
    return function (req, res) {
          var result=req.post;
          result.remove();
          result.save(function (err) {
            if (!err) {
              res.send({});
            } else {
              res.send(errMsg(err));
            }
          });
    };
  }
  function postid(req, res, next, id){
    Post = mongoose.model('bookmark');
    Post.load(id, function (err, post) {
      if (err) return next(err)
      if (!post) return next(new Error('Failed to load article ' + id))
      req.post = post
      next()
    })
  }

  exports.initRoutesForModel = function (options) {
    var app = options.app,
      model = options.model,
      auth= options.auth,
      path,
      pathWithId;

    if (!app || !model) {
      return;
    }

    path = options.path || '/' + model.modelName.toLowerCase();
    pathWithId = path + '/:id';
    app.get(path, getListController(model));
    app.get(pathWithId, getReadController(model));
    app.post(path, auth.requiresLogin, getCreateController(model));
    app.put(pathWithId, auth.requiresLogin, auth.post.hasAuthorization, getUpdateController(model));
    app.del(pathWithId, auth.requiresLogin, auth.post.hasAuthorization, getDeleteController(model));
    app.param('id', postid)

  };

}(exports));
