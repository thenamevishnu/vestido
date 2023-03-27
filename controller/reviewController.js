const users = require("../model/userModel")
const orders = require("../model/orderModel")
const { default: mongoose } = require("mongoose")
const reviews = require("../model/reviewModel")
const carts = require("../model/cartModel")
const wishlist = require("../model/wishlistModel")
const product = require("../model/productModel")
const crypto = require("crypto")
const { ObjectId } = mongoose.Types

const getCwcount = (user_id)=>{
    return new Promise(async (resolve,reject)=>{
        response = {}
        let cart = await carts.findOne({user_id:new ObjectId(user_id)})
        let wish = await wishlist.findOne({user_id:new ObjectId(user_id)})
        response.cart = cart?.products ? cart.products.length : 0
        response.wish = wish?.products ? wish.products.length : 0
        resolve(response)
    })
}

module.exports = {

    postRating:async (req, res, next)=>{
        try{
            let user = req.session.user_id
            let product_id = req.body.product_id
            let rating = parseInt(req.body.rating)
            let review = await reviews.findOne({product_id:new ObjectId(product_id)})
            if(!review){
                await reviews.insertOne({product_id:new ObjectId(product_id)})
            }
            let existReview = await reviews.findOne({product_id:new ObjectId(product_id),"reviews.user_id":new ObjectId(user)})
            if(!existReview){
                let user_info = await users.findOne({_id:new ObjectId(user)})
                let uuid = await crypto.randomBytes(16).toString("hex");
                obj = {
                    id:uuid,
                    user_id : new ObjectId(user),
                    username:user_info.username,
                    photo:user_info.dp,
                    rating : rating,
                    text : ""
                }
                await reviews.updateOne({
                    product_id:new ObjectId(product_id)
                },{
                    $push:{
                        reviews:obj
                    }
                })
            }else{
                await reviews.updateOne({
                    product_id: new ObjectId(product_id),
                    "reviews.user_id":new ObjectId(user)
                },{
                    $set:{
                        "reviews.$.rating":rating
                    }
                })
            }
        }catch(err){
            next()
        }
    },

    postReview:async (req, res, next)=>{
        try{
            let user = req.session.user_id
            let product_id = req.body.product_id
            let message = req.body.message
            await reviews.updateOne({
                product_id: new ObjectId(product_id),
                "reviews.user_id":new ObjectId(user)
            },{
                $set:{
                    "reviews.$.text":message
                }
            })
            res.json({status:true,product_id:product_id})
        }catch(err){
            next()
        }
    },

    showAllReviews:async (req, res, next)=>{
        try{
            let review = req.session.allReview ?? await reviews.findOne({product_id:new ObjectId(req.params.id)})
            review = review?.reviews
            let cwcount = await getCwcount(req.session.user_id)
            let product_id = req.params.id
            selected = req.session.review_selected
            res.render("showAllReviews",{title:"All Reviews",nofooter:true,cwcount,review,product_id,selected})
        }catch(err){
            next()
        }
    },

    reviewsSort:async (req, res, next)=>{
        try{
            let sortby = req.body.sort
            let product_id = req.body.product_id
            if(sortby=="latest"){
                review = await reviews.aggregate([
                    {
                        $match:{
                            product_id:new ObjectId(product_id)
                        }
                    },{
                        $project:{
                            _id:1,
                            product_id:1,
                            reviews:{
                                $reverseArray:"$reviews"
                            }
                        }
                    }
                ]).toArray()
            }
            if(sortby=="positive"){
                review = await reviews.aggregate([
                    {
                        $match:{
                            product_id:new ObjectId(product_id)
                        }
                    },{
                        $project:{
                            _id:1,
                            product_id:1,
                            reviews:{
                                $sortArray:{
                                    input:"$reviews",sortBy:{
                                        rating:-1
                                    }
                                }
                            }
                        }
                    }
                ]).toArray()
            }
            if(sortby=="negative"){
                review = await reviews.aggregate([
                    {
                        $match:{
                            product_id:new ObjectId(product_id)
                        }
                    },{
                        $project:{
                            _id:1,
                            product_id:1,
                            reviews:{
                                $sortArray:{
                                    input:"$reviews",sortBy:{
                                        rating:1
                                    }
                                }
                            }
                        }
                    }
                ]).toArray()
            }
            req.session.review_selected = sortby
            req.session.allReview = review[0]
            res.json({status:true})
        }catch(err){
            next()
        }
    }
}