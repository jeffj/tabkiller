(function (exports) {
  "use strict";
  var mongoose = require('mongoose')
    , crudUtils = require('../utils/crudUtilsBookmark')
    , crudUtilsBlock = require('../utils/crudUtilsBlock')
    , bookmark = mongoose.model('bookmark')
    , usermodel = mongoose.model('User')

    , blocks = mongoose.model('block')
    , users = require('../app/controller/users')
    , block = mongoose.model('block');

  function user(req, res) {
    var userid=req.path.replace(/^\/|\/$/g, '')

    userid=req.userReq._id
    console.log(req.userReq._id)
    res.render('index', { 
        'title': 'Pelican'
        , 'username':(req.user) ?  req.user.username: undefined
        , 'userid':(req.user) ?  req.user._id: undefined
        , block: undefined
        , home: false
        , userId: userid
      });
  }

  function bucket(req, res) {
    var blockId=req.path.replace(/^\/|\/$/g, '')
    res.render('index', { 
        'title': 'Pelican'
        , 'username':(req.user) ?  req.user.username: undefined
        , 'userid':(req.user) ?  req.user._id: undefined
        , block: blockId.length ? blockId: undefined
        , home: false
      });
  }
  function index(req, res) {
    res.render('index', { 
        'title': 'Pelican'
        , 'username':(req.user) ?  req.user.username: undefined
        , 'userid':(req.user) ?  req.user._id: undefined
        , block: undefined
        , home: true
      });
  }
  function blockid(req, res, next, id){
    block.load(id, function (err, post) {
      if (err) return next(err)
      if (!post) return next(new Error('Failed to load article ' + id))
      req.post = post
      next()
    })
  }
  function userid(req, res, next, id){
    usermodel.load(id, function (err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('Failed to load article ' + id))
      req.userReq = user
      next()
    })
  }
  exports.init = function (app, auth, passport) {
    app.get('/',index);
    app.get('/login', users.login);
    app.get('/signup', users.signup);
    app.get('/logout', users.logout)
    app.post('/users', users.create)
    app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password.'}), users.session)
    
    crudUtils.initRoutesForModel({ 'app': app, 'model': bookmark, auth: auth });
    crudUtilsBlock.initRoutesForModel({ 'app': app, 'model': blocks, auth: auth });
    app.get('/:blockid',bucket);
    app.param('blockid', blockid)

    app.get('/user/:userid',user);
    app.param('userid', userid)
  };
}(exports));