const carts = require("../model/cartModel")
const { default: mongoose } = require("mongoose")
const wishlist = require("../model/wishlistModel")
const product = require("../model/productModel")
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
    getWishlist:async (req, res, next)=>{
        try{
            let user = req.session.user_id
            let items = await wishlist.aggregate([{
            $match:{
                user_id:new ObjectId(user)
            }},
            {
                $unwind:"$products"
            },
            {
                $project:{
                    product_id:"$products.product_id",
                    size:"$products.size",
                }
            },
            {
                $lookup:{
                    from:"products",
                    localField:"product_id",
                    foreignField: "_id",
                    as:"product_details"
                }
            }
            ]).toArray()
            let cwcount = await getCwcount(user)
            err = req.session.wish_err
            res.render("wishlist",{title:"My Wishlist",items,nofooter:true,cwcount,err}) 
            req.session.wish_err = null
        }catch(err){
            next()
        }
    },

    addtowishlistById:async (req, res, next)=>{
        try{
            req.session.err = "Select Size!"
            res.redirect("/product_details/"+req.params.id+"")
        }catch(err){
            next()
        }
    },

    addtowishlistBySize:async (req, res, next)=>{
        try{
            let exist = 0
            let user = req.session.user_id
            let wishlists = await wishlist.findOne({user_id:new ObjectId(user)})
            if(!wishlists){
                let obj = {
                    user_id : new ObjectId(user),
                    products : [{
                        product_id : new ObjectId(req.params.id),
                        size : req.params.size,
                    }]
                }
                await wishlist.insertOne(obj)
                res.redirect("/wishlist")
            }else{
                if(wishlists.products){
                    await wishlists.products.forEach(data => {
                        if(data.product_id == req.params.id && data.size == req.params.size){
                            req.session.err = "Product already exist in your wishlist!"
                            exist = -1
                            res.redirect("/product_details/"+req.params.id+"")
                        }
                    })
                }
                if(exist == 0){
                    let product = {
                        product_id : new ObjectId(req.params.id),
                        size : req.params.size,
                    }
                    await wishlist.updateOne({user_id:new ObjectId(user)},{$push:{products:product}})
                    res.redirect("/wishlist")
                }
            }
        }catch(err){
            next()
        }
    },

    remove_wishlist:async (req, res, next)=>{
        try{
            await wishlist.updateOne({
            user_id:new ObjectId(req.session.user_id)
            },{
                $pull:{
                    "products":{
                        product_id:new ObjectId(req.params.id),
                        size:req.params.size
                    }
                }
            })
            res.redirect("/wishlist")
            }catch(err){
                next()
            }
    },

    toCart:async (req, res, next)=>{
        try{
            const id = req.params.id
            const size = req.params.size
            let user = req.session.user_id
            let exist = 0
            let cart = await carts.findOne({user_id:new ObjectId(user)})
            let products = await product.findOne({_id:new ObjectId(id)})
            let price = parseFloat(products.price)
            if(!cart){
                let obj = {
                    user_id : new ObjectId(user),
                    products : [{
                        product_id : new ObjectId(id),
                        size : size,
                        quantity : 1,
                        price:price,
                        total: price
                    }]
                }
                await carts.insertOne(obj)
                res.redirect("/cart")
            }else{
                if(cart.products){
                    await cart.products.forEach(data => {
                        if(data.product_id == req.params.id && data.size == req.params.size){
                            req.session.wish_err = "Product already exist in your cart!"
                            exist = -1
                            res.redirect("/wishlist")
                        }
                    })
                }
                if(exist == 0){
                    let product = {
                        product_id : new ObjectId(id),
                        size : size,
                        quantity : 1,
                        price:price,
                        total: price
                    }
                    await carts.updateOne({user_id:new ObjectId(user)},{$push:{products:product}})
                    res.redirect("/cart")
                }
            }
        }catch(err){
            next()
        }
    }
}