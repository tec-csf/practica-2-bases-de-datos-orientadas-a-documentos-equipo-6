let mongoose = require('mongoose');

let CountrySchema = mongoose.Schema({
    CountryID: Number,
    CountryName: String
}, { collection : 'Country' });

module.exports = mongoose.model('Country', CountrySchema);
