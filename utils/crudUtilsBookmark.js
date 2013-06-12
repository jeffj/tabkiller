/**
 * Very basic CRUD route creation utility for models.
 * For validation, simply override the model's save method.
 */

(function (exports) {
  var parseUtils = require("./parseUtils.js")
    , mongoose = require('mongoose')
    , createUtils = require("./createUtils.js")
    , post = mongoose.model('bookmark');



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
      q={}
      var block=req.param('block');
      if (block) q.block=block;

      //if (req.)
      model
        .find(q)
        .populate("user", "username")
        .populate("urlObj")
        .populate("block")
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

      if(result[i].block)
        result[i].blocktitle=result[i].block.title,
        result[i].blockid=String(result[i].block._id);

      if(result[i].urlObj)
        result[i].url=result[i].urlObj.url,
        result[i].title=result[i].urlObj.title;
        result[i].favicon=result[i].urlObj.favicon;
    };
    return result
  }





  //------------------------------
  // Create
  //
  function getCreateController(model) {
    return function (req, res) {
      var m = new model(req.body), urlString=req.body.url;

      createUtils.url(urlString, function(err, urlObj){


            parseUtils.parser(urlString, urlObj, function(err, urlObj){

              createUtils.block(req.body.block, function(err, blockObj){

                m.urlObj=urlObj, m.block=blockObj,m.user=req.user;

                m.save(function(err){
                  if (!err) {
                    var sender=m.toJSON()
                    sender.user={username:req.user.username}
                    sender.url=urlObj.url
                    sender.title=urlObj.title
                    sender.favicon=urlObj.favicon                
                    res.send(sender);
                  } else {
                    res.send(errMsg(err));
                  }
                });

              });//createUtils.url
           
            });//parseUtils

          });//createUtils.url


       

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
    console.log(1)
    return
    post.load(id, function (err, post) {
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
    pathWithId = path + '/:idbook';

    console.log(path)


    app.get(path, getListController(model));
    app.get(pathWithId, getReadController(model));
    app.post(path, auth.requiresLogin, getCreateController(model));
    app.put(pathWithId, auth.requiresLogin, auth.post.hasAuthorization, getUpdateController(model));
    app.del(pathWithId, auth.requiresLogin, auth.post.hasAuthorization, getDeleteController(model));
    app.param('idbook', postid)

  };

}(exports));
