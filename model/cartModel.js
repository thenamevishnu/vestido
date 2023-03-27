const mongoose = require("mongoose")

const cart = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    products:{
        type:Array
    }
})

const carts = mongoose.model("carts",cart).collection
module.exports = carts