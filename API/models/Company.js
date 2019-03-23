let mongoose = require('mongoose');

let CompanySchema = mongoose.Schema({
    CompanyID: Number,
    Name: String,
    Description: String,
    No_Employees: Number,
    OwnerID: Number,
    CountryID: Number
}, { collection : 'Company' });

module.exports = mongoose.model('Company', CompanySchema);
