var Event = require('../models/Events');
var Users = require('../models/Users');

module.exports = function (app, passport, Yelp) {
    
  var yelp = new Yelp({
    consumer_key: process.env.YELP_KEY,
    consumer_secret: process.env.YELP_SECRET,
    token: process.env.YELP_TOKEN,
    token_secret: process.env.YELP_TOKEN_SECRET,
  });
  
  app.get('/find/:loc', function(req, res) {
    yelp.search({ term: 'restaurants', location: req.params.loc }).then(function (data) {
        res.json(data)
/*        Users.findOneAndUpdate({'idUser': req.user.github.id}, { query: req.params.loc }, function(err) {
          if(err) throw err;
        })*/
    }).catch(function (err) {
        console.error(err);
    });
  })
  
  app.post('/log', function(req, res) {
    var evObj = {idUser: req.user.github.id, idEvent: req.body.id};
    var event = new Event(evObj);
    event.save(function(err) {
      if(err) throw err;
      Event.find({'idEvent': req.body.id}, function(err, events) {
        if(err) throw err;
        res.json(events.length);
      })
    })
  });
  
  app.delete('/log/:idEv', function(req, res){
    Event.find({'idUser': req.user.github.id}).remove({'idEvent': req.params.idEv}, function(err){
      if(err) throw err;
      Event.find({'idEvent': req.body.id}, function(err, events) {
        if(err) throw err;
        res.json(events.length);
      })
    })
  });
    
  // initiate authentication with GitHub 
  app.get('/auth/github', passport.authenticate('github'));

  // called after GitHub authentication
  app.get('/auth/github/callback', passport.authenticate('github'), function(req, res) { 
      res.redirect('/'); 
    });

  // logout
	app.get('/logout', function (req, res) { 
	  req.logout();
	  res.redirect('/');
	});
	
	// API для проверки на аутентификацию
  app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user.github.id : '0');
  });
	
  
};
