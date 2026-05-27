const mangoose = require('mongoose')


const NewsSchema = new mangoose.Schema({
    
    title: {type:String, required:true},
    content: {type: String, required:true},
    postedOn: {type: Date, required:true} 

})

module.exports = mangoose.model('News', NewsSchema);