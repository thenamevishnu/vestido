const { default: mongoose } = require("mongoose")
const carts = require("../model/cartModel")
const product = require("../model/productModel")
const { ObjectId } = mongoose.Types
const wishlist = require("../model/wishlistModel")

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
    getCart:async (req, res, next)=>{
        try{
            let user = req.session.user_id
            let items = await carts.aggregate([{
                $match:{
                    user_id:new ObjectId(user)
                }},
                {
                    $unwind:"$products"
                },
                {
                    $project:{
                        product_id:"$products.product_id",
                        qty:"$products.quantity",
                        size:"$products.size",
                        total:"$products.total"
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
            let grandTotal = await carts.aggregate([
                {
                    $match:{
                        user_id:new ObjectId(user)
                    }
                },
                {
                    $unwind:"$products"
                },
                {
                    $group:{
                        _id:null,
                        total:{
                            $sum:"$products.total"   
                        }
                    }
                }
            ]).toArray()
            grandTotal = grandTotal.length==0 ? 0 : grandTotal[0].total
            let cwcount = await getCwcount(user)
            cart_err = req.session.cart_err
            res.render("cart",{title:"My Cart",items,grandTotal,nofooter:true,cwcount,cart_err})
            req.session.cart_err = null      
        }catch(err){
            next()
        }   
    },

    updateQty:async (req, res, next)=>{
        try{
            let qty = parseInt(req.body.qty)
            let products = await product.findOne({_id:new ObjectId(req.body.product_id)})
            if(qty<parseInt(products.stocks)){
                let price = parseFloat(products.price)
                let total = parseFloat(products.price * qty)
                let index = req.body.index
                let key1 = "products."+index+".price"
                let key2 = "products."+index+".quantity"
                let key3 = "products."+index+".total"
                await carts.updateOne({
                    user_id:new ObjectId(req.session.user_id)
                },{
                    $set:{
                        [key1]:price,
                        [key2]:qty,
                        [key3]:total
                    }
                })
                res.json({status:true})
            }else{
                res.json({status:false})
            }
        }catch(err){
            next()
        }
    },

    addToCartWithId:(req, res, next)=>{
        try{
            req.session.err = "Select Size!"
            res.redirect("/product_details/"+req.params.id+"")
        }catch(err){
            next()
        }
    },

    addToCartWithSize:async (req, res, next)=>{
        try{
            let exist = 0
            let user = req.session.user_id
            let products = await product.findOne({_id:new ObjectId(req.params.id)})
            let price = parseFloat(products.price)
            let cart = await carts.findOne({user_id:new ObjectId(user)})
            if(!cart){
                let obj = {
                    user_id : new ObjectId(user),
                    products : [{
                        product_id : new ObjectId(req.params.id),
                        size : req.params.size,
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
                            req.session.err = "Product already exist in your cart!"
                            exist = -1
                            res.redirect("/product_details/"+req.params.id+"")
                        }
                    })
                }
                if(exist == 0){
                    let product = {
                        product_id : new ObjectId(req.params.id),
                        size : req.params.size,
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
    },

    deleteFromCart:async (req, res, next)=>{
        try{
            await carts.updateOne({
                user_id:new ObjectId(req.session.user_id)
            },{
                $pull:{
                    "products":{
                        product_id:new ObjectId(req.params.product_id),
                        size:req.params.size
                    }
                }
            })
            res.redirect("/cart")
        }catch(err){
            next()
        }
    },


}