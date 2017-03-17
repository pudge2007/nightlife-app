var async = require('async');
var Event = require('../models/Events');
var Users = require('../models/Users');

module.exports = function (app, passport, Yelp) {
  
/*  function getCounts(evId, callback) {
    Event.find({'idEvent': evId}, function(err, events) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, events.length);
      }
    });
  };*/
  
  var yelp = new Yelp({
    consumer_key: process.env.YELP_KEY,
    consumer_secret: process.env.YELP_SECRET,
    token: process.env.YELP_TOKEN,
    token_secret: process.env.YELP_TOKEN_SECRET,
  });
  
  app.get('/find/:loc', function(req, res) {
    async.parallel({
      bars: function(callback){
        return yelp.search({ term: 'restaurants', location: req.params.loc }, function (err, results) {
          return callback(err, results);
        });
      },
     events: function(callback){
        return Event.find({ 'query': req.params.loc }, function (err, logs) {
          return callback(err, logs);
        });
      }  
      }, function(err, results){
        if (err) throw err;
        var counts = results.bars.businesses.map(function(item){
          var i = 0;
          results.events.forEach(function(ev){
            if(ev.idEvent === item.id)
              i++;
          })
          return i;
        })
        res.json({bars:results.bars, counts: counts});
    });
  })
  
  app.post('/log', function(req, res) {
    var evObj = {idUser: req.user.github.id, idEvent: req.body.id, query: req.body.query};
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
