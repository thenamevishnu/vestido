const carts = require("../model/cartModel")
const users = require("../model/userModel")
const orders = require("../model/orderModel")
const { default: mongoose } = require("mongoose")
const product = require("../model/productModel")
const categories = require("../model/categoryModel")
const { ObjectId } = mongoose.Types
const wishlist = require("../model/wishlistModel")
const reviews = require("../model/reviewModel")

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
    getShop:async (req, res, next)=>{
        try{
            let cwcount = await getCwcount(req.session.user_id) ?? 0
            let category = await categories.find({status:{$eq:true}}).toArray()
            let category_array = []
            await category.forEach(key=>{
                category_array.push(key.category)
            })
            let data = await product.aggregate([{
                $match:{
                    category:{
                        $in:category_array
                    }
                }
            },{
                    $group:
                {
                    _id:"$category",
                    Total:{
                        $count:{}
                    }
                }
            }]).toArray()
            products = req.session.sort
            if(!products){
                products = await product.find({category:{$in:category_array}}).limit(6).toArray()
                total_page = await product.countDocuments({category:{$in:category_array}})
                pagination = Math.ceil(total_page/6)
            }
            sel = req.session.selected
            filter = req.session.filter
            size = req.session.size
            let S,M,L,XL,XXL
            if(size){
                size.forEach(key=>{
                if(key=="S"){S=true}
                if(key=="M"){M=true}
                if(key=="L"){L=true}
                if(key=="XL"){XL=true}
                if(key=="XXL"){XXL=true}
                })
            }
             pagination = req.session.pagination ?? pagination
             if(pagination==1){
                pagination=0
             }
            res.render("shop",{title:"SHOP",products,cwcount,category,data,sel,shop:true,filter,size,S,M,L,XL,XXL,pagination})
        }catch(err){
            next()
        }
        
    },

    getShopPost:async (req, res, next)=>{
        try{
            let category = await categories.find({status:{$eq:true}}).toArray()
            let category_array = []
            await category.forEach(key=>{
                category_array.push(key.category)
            })
            let sort = req.body.sortBy ? req.body.sortBy : req.session.selected ? req.session.selected : "latest"
            let min = req.body.from ? parseInt(req.body.from) : req.session.min ? parseInt(req.session.min) : 0
            let max = req.body.to ? parseInt(req.body.to) : req.session.max ? parseInt(req.session.max) : 10000
            let sort_order = sort=="latest" ? -1 : sort=="low-high" ? 1 : sort=="high-low" ? -1 : 1
            let size = req.body['size[]'] ? req.body['size[]'] : req.session.size ? req.session.size : []
            let pageMin = req.body.pageMin ? req.body.pageMin : 0
            let pageMax = req.body.pageMax ? req.body.pageMax : 6
            if(!Array.isArray(size)){
                size = [size]
            }
            if(sort=="latest"){
                sortit = { _id:-1 }
            }else{
                sortit = { price:sort_order }
            }
            
            if(size.length==0 || (!req.body.sortBy && !req.body.from && !req.body.to && !req.body['size[]'])){
                req.session.sort = await product.find({
                    category:{
                        $in:category_array
                    },
                    price:{
                        $gte:min,
                        $lte:max
                    }
                }).sort(sortit).skip(parseInt(pageMin)).limit(parseInt(pageMax)).toArray()
                total_page = await product.countDocuments({
                    category:{
                        $in:category_array
                    },
                    price:{
                        $gte:min,
                        $lte:max
                    }
                })
                pagination = Math.ceil(total_page/6)
                req.session.size = null
                console.log("1");
            }else{
                req.session.sort = await product.find({
                    category:{
                        $in:category_array
                    },
                    size:{
                        $all:size
                    },
                    price:{
                        $gte:min,
                        $lte:max
                    }
                }).sort(sortit).skip(parseInt(pageMin)).limit(parseInt(pageMax)).toArray()
                total_page = await product.countDocuments({
                    category:{
                        $in:category_array
                    },
                    size:{
                        $all:size
                    },
                    price:{
                        $gte:min,
                        $lte:max
                    }
                })
                pagination = Math.ceil(total_page/6)
                req.session.size = size
            }
            req.session.pagination  = pagination
            req.session.selected = sort
            req.session.min = min
            req.session.max = max
            req.session.filter = min+"-"+max
            res.redirect("/shop")
        }catch(err){
            next()
        }
        
    },

    getSingleProduct:async (req, res, next)=>{
        try{
            let cwcount = await getCwcount(req.session.user_id) ?? 0
            let products = await product.findOne({_id:new ObjectId(req.params.id)})
            let outofstock = products.stocks==0 ? true : false
            let review_document = await reviews.findOne({product_id:new ObjectId(req.params.id)})
            let totalReview = review_document?.reviews ? parseInt(review_document.reviews?.length) : 0
            let ratingAvg = await reviews.aggregate([
                {
                    $unwind:"$reviews"
                },{
                    $group:{
                        _id:"$product_id",
                        avg:{
                            $avg:"$reviews.rating"
                        }
                    }
                },{
                    $match:{
                        _id:new ObjectId(req.params.id)
                    }
                }
            ]).toArray()
            ratingAvg = parseInt(ratingAvg[0]?.avg)
            err = req.session.err
            let review = []
            i=0
            while(i<5){ 
                if(review_document?.reviews[i]){
                    review.push(review_document?.reviews[i]); 
                }
                i++ 
            }
            res.render("product_details",{title:products.title,products,err,cwcount,outofstock,review,totalReview,ratingAvg})
            req.session.err=null   
        }catch(err){
            next()
        }
        
    },

    searchResult:async (req, res, next)=>{
        try{
            let payload = req.body.payload.trim()
            let search = await product.find({title:{$regex:new RegExp('^'+payload+'.*','i')}}).toArray()
            res.send({payload:search})
        }catch(err){
            next()
        }
        
    },

    reviewPage:async (req, res, next)=>{
        try{
            let order = await orders.findOne({user_id:new ObjectId(req.session.user_id),"orders.product_id":new ObjectId(req.params.id),"orders.status":"Confirmed"})
            let products = await product.findOne({_id:new ObjectId(req.params.id)})
            let status
            if(order){
                status = true
            }else{
                status = false
            }
            let cwcount = await getCwcount(req.session.user_id)
            res.render("review",{title:"REVIEW",products,cwcount,status})
        }catch(err){
            next()
        }
    }
}