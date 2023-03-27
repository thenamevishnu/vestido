const mongoose = require("mongoose")

const user = new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        required:true
    },
    balance:{
        type:Number,
        required:true,
        default:0
    },
    address:{
        type:Array
    },
    gender:{
        type:String
    }
})

const users = mongoose.model("users",user).collection
module.exports = users