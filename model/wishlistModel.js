const mongoose = require("mongoose")

const wishlist = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    products:{
        type:Array
    }
})

const wishlists = mongoose.model("wishlists",wishlist).collection
module.exports = wishlists