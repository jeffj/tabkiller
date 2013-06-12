(function (exports) {
  "use strict";
  var mongoose = require('mongoose')
    , crudUtils = require('../utils/crudUtils')
    , bookmark = mongoose.model('bookmark')
    , users = require('../app/controller/users')
    , block = mongoose.model('block');

  function index(req, res) {
    console.log(req.path.replace(/^\/|\/$/g, ''))
    var blockId=req.path.replace(/^\/|\/$/g, '')


    res.render('index', { 
        'title': 'Pelican'
        , 'username':(req.user) ?  req.user.username: undefined
        , 'userid':(req.user) ?  req.user._id: undefined
        , block: blockId.length ? blockId: undefined
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
  exports.init = function (app, auth, passport) {
    app.get('/',index);

    app.get('/login', users.login);
    app.get('/signup', users.signup);
    app.get('/logout', users.logout)
    app.post('/users', users.create)
    app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password.'}), users.session)
    crudUtils.initRoutesForModel({ 'app': app, 'model': bookmark, auth: auth });

    app.get('/:blockid',index);
    app.param('blockid', blockid)
  };
}(exports));