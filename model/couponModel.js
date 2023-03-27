const mongoose = require("mongoose")

const coupon = new mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    from:{
        type:Date,
        required:true
    },
    to:{
        type:Date,
        required:true
    },
    remaining:{
        type:Number,
        required:true
    },
    stocks:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true
    }
})

const coupons = mongoose.model("coupons",coupon).collection
module.exports = coupons