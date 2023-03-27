const mongoose = require("mongoose")

const order = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    orders:{
        type:Array,
        required:true
    }
})

const orders = mongoose.model("orders",order).collection
module.exports = orders