const mongoose = require("mongoose")

const review = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    products:{
        type:Array
    }
})

const reviews = mongoose.model("reviews",review).collection
module.exports = reviews