var User = require('../models/Users');

module.exports = function (app, passport, Yelp) {
    
  var isLoggedIn = function (req, res, next) {
  	if (!req.isAuthenticated())
  	  res.send(401);
  	else
      next();		
  }
  
  var yelp = new Yelp({
    consumer_key: process.env.YELP_KEY,
    consumer_secret: process.env.YELP_SECRET,
    token: process.env.YELP_TOKEN,
    token_secret: process.env.YELP_TOKEN_SECRET,
  });
  
  app.get('/find/:loc', function(req, res) {
    yelp.search({ term: 'restaurants', location: req.params.loc }).then(function (data) {
        res.json(data)
    }).catch(function (err) {
        console.error(err);
    });
  })
    
  // initiate authentication with GitHub 
  app.get('/auth/github', passport.authenticate('github'));

  // called after GitHub authentication
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) { 
      res.redirect('/profile'); 
    });

  // logout
	app.get('/logout', isLoggedIn, function (req, res) { 
	  req.logout();
	  res.redirect('/login'); 
	});
	
	// API для проверки на аутентификацию
  app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user.github.id : '0');
  });
	
  
};
