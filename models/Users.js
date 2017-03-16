var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	github: {
	    id: String,
		username: String,
		displayName: String,
		query: String
	}
});

module.exports = mongoose.model('User', UserSchema);
