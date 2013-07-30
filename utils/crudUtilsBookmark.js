/**
 * Very basic CRUD route creation utility for models.
 * For validation, simply override the model's save method.
 */

(function (exports) {
  var parseUtils = require("./parseUtils.js")
    , mongoose = require('mongoose')
    , createUtils = require("./createUtils.js")
    , user = mongoose.model('User')
    , _ = require('underscore')
    , post = mongoose.model('bookmark')
    , urlObj =mongoose.model('url')

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
      var block=req.param('block');
      var home=req.param('home');
      var userId=req.param('userId');

      var q={}
      if (block) q.block=block;  //limit by blocks
      if (home)  q.user=req.user 
      if (userId)  q.user=userId
        model
          .find(q)
          .populate("user", "username")
          .populate("urlObj")
          .populate("block")
          .populate("blockUser", "username")
          .sort("createdAt")
          .lean()
          .exec(function(err, resultUserBookmarks){


            var mongo_qURL=pullURLMongoQ(resultUserBookmarks,"_id")

          
          urlObj
            .find(mongo_qURL)
            .sort("-lastUpdate")// This should be a s sort by modified date
            .limit(10)
            .lean()
            .exec(function(err, resultUserURL){

                      // for (var i = resultUserURL.length - 1; i >= 0; i--) {
                      //   resultUserURL[i].urlMatch=true
                      // };

                      //cross filtering for rexcent updates URL
                      var ids = {};
                      _.each(resultUserURL, function (bb) { 
                        ids[bb._id] = true; 
                      });

                      var out = _.filter(resultUserBookmarks, function (val) {
                          var match=ids[val.urlObj._id];
                          return match;
                      }, resultUserURL);
                      
                      


                      

                      combinedList=out.concat(resultUserBookmarks.slice(0,200))


                      combinedList=_.sortBy(combinedList, function(obj){ 
                        return new Date(obj.urlObj.lastUpdate).getTime() 
                      });


                      combinedList=_.uniq(combinedList,function(item,key,a){
                          return item
                      });


                      console.log(out.length)

                      console.log(combinedList.length)

                      var json;
                      json=parseResults(combinedList, req.user); //adds a myPost key for the post the user ownes

                      var PostQ=pullURLMongoQ(combinedList, "urlObj")
                      model
                        .find(PostQ)
                        .populate("user", "username")
                        .populate("block")
                        .exec(function (err, resultPosts) {

                        finalJson=_.map(json, function(mapped){ 
                          var matched=_.filter(resultPosts, function(filter){ 
                            return String(filter.urlObj)==String(mapped.urlObj._id) &&  String(filter._id)!= String(mapped._id)

                          });
                          mapped.OtherBookmarkBlocks=matched;
                          return mapped; 

                        });



                        res.send(finalJson);

                      });

            })

          });




//       limit by my bookmarks for home

      // model
      //   .find(q)
      //   .populate("user", "username")
      //   .populate("urlObj")
      //   .populate("block")
      //   .populate("blockUser", "username")
      //   .sort("createdAt")
      //   .lean()
      //   .exec(function (err, result) {


      //   if (!err) {
      //     var json;
      //     json=parseResults(result, req.user); //adds a myPost key for the post the user ownes

      //     var PostQ=pullURLMongoQ(result, "urlObj")
      //     model
      //       .find(PostQ)
      //       .populate("user", "username")
      //       .populate("block")
      //       .exec(function (err, resultPosts) {
            
      //       finalJson=_.map(json, function(mapped){ 
      //         var matched=_.filter(resultPosts, function(filter){ 
      //           return String(filter.urlObj)==String(mapped.urlObj._id) &&  String(filter._id)!= String(mapped._id)

      //         });
      //         mapped.OtherBookmarkBlocks=matched;
      //         return mapped; 

      //       });

      //                  console.log(finalJson)

      //       res.send(finalJson);

      //     });

      //   } else {
      //     res.send(errMsg(err));
      //   }

      // });



    };
  }

  function pullURLMongoQ(postList, feild){
    var array=[],mObj={};



    for (var i = postList.length - 1; i >= 0; i--) {
      var URLId;
      if (postList[i].urlObj._id) URLId=postList[i].urlObj._id; else URLId=postList[i].urlObj;
//      if (postList[i].totalBookmarks>1)
       array.push(URLId)
    };  

    mObj[feild]={ $in: array };
    return mObj;

  };

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
      
      if(result[i].blockUser)
        result[i].blockUserName=result[i].blockUser.username;

      if(result[i].urlObj)
        result[i].url=result[i].urlObj.url,
        result[i].title=result[i].urlObj.title;
    //    result[i].totalBookmarks=result[i].urlObj.totalBookmarks;
      if (result[i].urlObj.favicon)
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

      createUtils.url(urlString,req.user, function(err, urlObj){


            parseUtils.parser(urlString, urlObj, function(err, urlObj){


              createUtils.block(req.body.block, req.user,  function(err, blockObj){

                m.urlObj=urlObj, m.block=blockObj,m.user=req.user, m.blockUser=blockObj.user;

                model//find other people who have 
                  .find({urlObj:urlObj})
                  .populate("user", "username")
                  .populate("block")
                  .exec(function(err, resultsURL){

                    
                      m.save(function(err){
                        if (!err) {
                          var sender=m.toJSON()
                          sender.OtherBookmarkBlocks=resultsURL
                          sender.user={username:req.user.username}
                          sender.url=urlObj.url
                          sender.title=urlObj.title
                          sender.favicon=urlObj.favicon                
                          res.send(sender);
                        } else {
                          res.send(errMsg(err));
                        }
                      });
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
    app.get(path, getListController(model));
    app.get(pathWithId, getReadController(model));
    app.post(path, auth.requiresLogin, getCreateController(model));
    app.put(pathWithId, auth.requiresLogin, auth.post.hasAuthorization, getUpdateController(model));
    app.del(pathWithId, auth.requiresLogin, auth.post.hasAuthorization, getDeleteController(model));
    app.param('idbook', postid)

  };

}(exports));
