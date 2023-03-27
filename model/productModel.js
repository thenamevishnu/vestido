const mongoose = require("mongoose")

const product = new mongoose.Schema({
    photo:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    sub_category:{
        type:String,
        required:true
    },
    stocks:{
        type:Number,
        required:true
    },
    reviews:{
        type:Array
    }
})

const products = mongoose.model("products",product).collection
module.exports = products