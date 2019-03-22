let mongoose = require('mongoose');

let PersonSchema = mongoose.Schema({
    PersonID: Number,
    Name: String,
    Age: Number,
    Email: String
}, { collection : 'Person' });

module.exports = mongoose.model('Person', PersonSchema);
