var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    idUser: String,
    idEvent: String,
    query: String
});

module.exports = mongoose.model('Event', EventSchema);
