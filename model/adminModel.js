const mongoose = require("mongoose")

const admin = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const admins = mongoose.model("admins",admin).collection
module.exports = admins