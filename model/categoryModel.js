const mongoose = require("mongoose")

const category = new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    sub_category:{
        type:Array,
        required:true
    },
    status:{
        type:Boolean,
        default:1,
        required:true
    }
})

const categories = mongoose.model("categories",category).collection
module.exports = categories