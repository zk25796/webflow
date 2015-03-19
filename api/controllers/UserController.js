/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  signup: function(req,res){
    res.view('signup');
  },
  login: function (req, res) {
    var bcrypt = require('bcrypt');

    User.findOneByEmail(req.param("email")).exec(function (err, user) {
      if (err) res.json({ error: 'DB error' }, 500);

      if (user) {
        bcrypt.compare(req.param("password"), user.password, function (err, match) {
          if (err) res.json({ error: 'Server error' }, 500);

          if (match) {
            // password match
            req.session.user = user.id;
            res.view('panel',{
              username: user.username,
              email: user.email,
              avatar: user.avatar,

            });
          } else {
            // invalid password
            if (req.session.user) req.session.user = null;
            res.json({ error: 'Invalid password' }, 400);
          }
        });
      } else {
        res.json({ error: 'User not found' }, 404);
      }
    });
  },
  logout: function(req,res){
    req.session = null;
    return res.redirect("/signup");
  },
  create: function(req,res,next){
    var params = req.params.all();
    if (params.password != params.confirmation){
      req.flash("Passowrds don't match");
      return res.redirect('/signup');
    }
    var Gravatar = require('machinepack-gravatar');
    // Build the URL of a gravatar image for a particular email address.
    Gravatar.getImageUrl({
      emailAddress: params.email,
      gravatarSize: 400,
      defaultImage: 'http://www.gravatar.com/avatar/00000000000000000000000000000000',
      rating: 'g',
      useHttps: true
    }).execSync({
      'error': function(){
        params.avatar = 'http://www.gravatar.com/avatar/00000000000000000000000000000000'
      },
      'encodingFailed': function(){
        params.avatar = 'http://www.gravatar.com/avatar/00000000000000000000000000000000'
      },
      'success': function(imgUrl){
        params.avatar = imgUrl
      }
    });
    User.create(params, function userCreated(err,user){
      if(err){
        req.flash('err',err.ValidationError);
        return res.redirect('/signup');
      }
      return res.json(user);
    });
  }
};

