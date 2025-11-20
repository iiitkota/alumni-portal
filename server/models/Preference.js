const mongoose = require('mongoose');


const PreferenceSchema = new mongoose.Schema({
    instituteId: { type: String, required:true },
    phoneVisible: { type: Boolean, default:true }
})


module.exports = mongoose.model('Preference',PreferenceSchema )