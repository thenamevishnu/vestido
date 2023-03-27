const carts = require("../model/cartModel")
const users = require("../model/userModel")
const { default: mongoose } = require("mongoose")
const product = require("../model/productModel")
const orders = require("../model/orderModel")
const { ObjectId } = mongoose.Types
const wishlist = require("../model/wishlistModel")
const crypto = require("crypto");
const coupon = require("../model/couponModel")
const Razorpay = require('razorpay')
require("dotenv").config()

const instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

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
    orderSuccess:async (req, res, next)=>{
        try{
            let cwcount = await getCwcount(req.session.user_id)
            res.render("success",{title:"SUCCESS",nofooter:true,cwcount})   
        }catch(err){
            next()
        }   
    },

    cartCheckout:async (req, res, next)=>{
        try{
            let user = req.session.user_id
            let products = await carts.aggregate([{
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
            if(products.length==0){
                res.redirect("/shop")
            }else{
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
                grandTotal = grandTotal[0].total;
                let cwcount = await getCwcount(user)
                let userInfo = await users.findOne({_id:new ObjectId(user)})
                let userBalance = parseFloat(userInfo?.balance) == 0 ? 0 : parseFloat(userInfo?.balance)
                let cart = await carts.findOne({user_id:new ObjectId(user)})
                await cart.products.forEach(async (data)=>{
                    let result = await product.findOne({_id:new ObjectId(data.product_id)})
                    if(result.stocks<data.quantity){
                        req.session.cart_err = "Not enough stocks : "+result.title+" ( left : "+result.stocks+" )"
                        res.redirect("/cart")
                    }else{
                        req.session.cart_err = null
                    }
                })
                address = userInfo.address
                userData = req.session?.address_select ?? ""
                let datenow = Math.floor(new Date().getTime()/1000)
                await coupon.updateMany({status:"pending",from:{$lte:datenow}},{$set:{status:"enabled"}})
                await coupon.updateMany({status:"enabled",to:{$lte:datenow}},{$set:{status:"expired"}})
                let coupons = await coupon.find({status:"enabled",remaining:{$gt:0},min_purchase:{$lte:grandTotal}}).toArray()
                if(grandTotal <= userBalance){
                    cod = true
                }else{
                    cod = false
                }
                res.render("checkout",{title:"CHECKOUT",products,grandTotal,cwcount,address,userData,coupons,userBalance,cod})
                req.session.address_select = null
            }
        }catch(err){
            next()
        }
    },

    checkoutData:async (req, res, next)=>{
        try{
            let data = req.body
            req.session.orderAddress = data;
            let exist = 0
            if(data.saveAddress=="on"){
                let result = await users.findOne({
                    _id:new ObjectId(req.session.user_id),
                })
                if(result?.address){
                    await result.address.forEach(address=>{
                        if(data.zip == address.zip && ( data.phone == address.phone || data.email == address.email)){
                            exist = 1
                        }
                    })
                }
                if(exist==0){
                    let address_id = await crypto.randomBytes(16).toString("hex");
                    let address = {
                        id:address_id,
                        country: data.country,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        address: data.address,
                        state: data.state,
                        zip: data.zip,
                        email: data.email,
                        phone: data.phone,
                    }
                    await users.updateOne({_id:new ObjectId(req.session.user_id)},{$push:{address:address}})
                }
            }
            if(data.payment=="cod"){
                payment = "COD"
            }
            if(data.payment=="online"){
                payment = "Online"
            }
            if(data.payment=="walletcod"){
                payment = "WalletCod"
            }
            if(data.payment=="walletonline"){
                payment = "WalletOnline"
            }

            if(payment == "Online" || payment == "WalletOnline"){
                let uuid = await crypto.randomBytes(16).toString("hex");
                    grandTotal = await carts.aggregate([
                    {
                        $match:{
                            user_id:new ObjectId(req.session.user_id)
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
                grandTotal = grandTotal[0].total;
                if(req.session?.discount){
                    let result = await coupon.findOne({code:req.session.discount.code,status:"enabled",remaining:{$gt:0}})
                    discount = req.session.discount.discount
                    disPrice = (grandTotal * discount / 100).toFixed(2)
                    if(disPrice>result.max_discount){
                        disPrice = (result.max_discount).toFixed(2)
                    }
                    grandTotal = (grandTotal - disPrice).toFixed(2)
                }
                if(payment == "WalletOnline"){
                    let result = await users.findOne({
                        _id:new ObjectId(req.session.user_id),
                    })
                    if(result.balance < grandTotal){
                        grandTotal = (grandTotal - result.balance).toFixed(2)
                        await users.updateOne({_id:new ObjectId(req.session.user_id)},{$set:{balance:0}})
                    }
                }
                const options = {
                    amount: grandTotal*100,
                    currency: "INR",
                    receipt: uuid
                };
                console.log(options);
                await instance.orders.create(options, function(err, order) {
                    console.log(order);
                    res.json(order)
                });
            }

            if(payment == "COD" || payment == "WalletCod"){
                let address = `Name : ${data.first_name} ${data.last_name} , ${data.address} , ${data.country} , ${data.state} , ${data.zip} , ${data.email} , ${data.phone}`
                let cart = await carts.aggregate([{
                    $match:{
                        user_id:new ObjectId(req.session.user_id)
                    }},
                    {
                        $unwind:"$products"
                    },
                    {
                        $project:{
                            product_id:"$products.product_id",
                            qty:"$products.quantity",
                            size:"$products.size",
                            price:"$products.price",
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
                            user_id:new ObjectId(req.session.user_id)
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
                grandTotal = grandTotal[0].total;
                let order_user = await orders.findOne({user_id:new ObjectId(req.session.user_id)})
                if(req.session?.discount){
                    let result = await coupon.findOne({code:req.session.discount.code,status:"enabled",remaining:{$gt:0}})
                    discount = req.session.discount.discount
                    disPrice = (grandTotal * discount / 100).toFixed(2)
                    if(disPrice>result.max_discount){
                        disPrice = (result.max_discount).toFixed(2)
                    }
                    grandTotal = (grandTotal - disPrice).toFixed(2)
                }
                if(payment == "WalletCod"){
                    let result = await users.findOne({
                        _id:new ObjectId(req.session.user_id),
                    })
                    if(result.balance <= grandTotal){
                        grandTotal = (grandTotal - result.balance).toFixed(2)
                        await users.updateOne({_id:new ObjectId(req.session.user_id)},{$set:{balance:0}})
                    }else
                    if(result.balance > grandTotal){
                        await users.updateOne({_id:new ObjectId(req.session.user_id)},{$inc:{balance:-grandTotal}})
                        grandTotal = 0
                        payment_status = "Paid"
                    }
                }
                if(!order_user){
                    let new_data = {
                        user_id:new ObjectId(req.session.user_id)
                    }
                    await orders.insertOne(new_data)
                }
                date = Math.floor(new Date().getTime()/1000)
                arrive = date + 432000;
                if(cart.length!=0){
                    let order_uuid = await crypto.randomBytes(16).toString("hex");
                    let thisMonth = (new Date().getMonth()) + 1
                    cart.forEach(async (param)=>{
                        let uuid = await crypto.randomBytes(16).toString("hex");
                        let product_info = await product.findOne({_id:new ObjectId(param.product_id)})
                        payment_status = payment_status ?? "Not Paid"
                        value = {
                            product_id:new ObjectId(product_info._id),
                            order_hash:order_uuid,
                            id:uuid,
                            image:product_info.thumb,
                            title:product_info.title,
                            brand:product_info.brand,
                            category:product_info.category,
                            sub_category:product_info.sub_category,
                            quantity:param.qty,
                            size:param.size,
                            price:param.price,
                            grandTotal:param.total,
                            total:parseFloat(grandTotal),
                            address:address,
                            payment_type:"COD",
                            payment_status:payment_status,
                            status:"Pending",
                            date:date,
                            month:thisMonth,
                            arrive:arrive,
                            notes:data.notes
                        }
                        await orders.updateOne({user_id:new ObjectId(req.session.user_id)},{$push:{orders:value}})
                    })
                    let response = await carts.findOne({user_id:new ObjectId(req.session.user_id)})
                    await response.products.forEach(async (data)=>{
                        let qty = parseInt(data.quantity)
                        await product.updateOne({_id:new ObjectId(data.product_id)},{$inc:{stocks:-qty}})
                    })
                    if(req.session?.discount){
                        await coupon.updateOne({code:req.session.discount.code},{$inc:{remaining:-1}})
                        req.session.discount = null
                    }
                    await carts.updateOne({user_id:new ObjectId(req.session.user_id)},{$unset:{"products":1}})
                    res.json({cod:true})
                }
            }
        }catch(err){
            next()
        }
    },

    verifyPayment:async (req, res, next)=>{
        try{
            console.log(req.body)
            let body=req.body['payment[razorpay_order_id]'] + "|" + req.body['payment[razorpay_payment_id]'];
            let expectedSignature = await crypto.createHmac("sha256",process.env.key_secret)
                                    .update(body.toString())
                                    .digest('hex');
            if(expectedSignature === req.body['payment[razorpay_signature]']){
                let data = req.session.orderAddress
                let address = `Name : ${data.first_name} ${data.last_name} , ${data.address} , ${data.country} , ${data.state} , ${data.zip} , ${data.email} , ${data.phone}`
                let cart = await carts.aggregate([{
                    $match:{
                        user_id:new ObjectId(req.session.user_id)
                    }},
                    {
                        $unwind:"$products"
                    },
                    {
                        $project:{
                            product_id:"$products.product_id",
                            qty:"$products.quantity",
                            size:"$products.size",
                            price:"$products.price",
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
                            user_id:new ObjectId(req.session.user_id)
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
                grandTotal = grandTotal[0].total;
                let order_user = await orders.findOne({user_id:new ObjectId(req.session.user_id)})
                if(!order_user){
                    let new_data = {
                        user_id:new ObjectId(req.session.user_id)
                    }
                    await orders.insertOne(new_data)
                }
                if(req.session?.discount){
                    let result = await coupon.findOne({code:req.session.discount.code,status:"enabled",remaining:{$gt:0}})
                    discount = req.session.discount.discount
                    disPrice = (grandTotal * discount / 100).toFixed(2)
                    if(disPrice>result.max_discount){
                        disPrice = (result.max_discount).toFixed(2)
                    }
                    grandTotal = (grandTotal - disPrice).toFixed(2)
                }
                date = Math.floor(new Date().getTime()/1000)
                arrive = date + 432000;
                if(cart.length!=0){
                    let order_uuid = await crypto.randomBytes(16).toString("hex");
                    let thisMonth = (new Date().getMonth()) + 1
                    cart.forEach(async (param)=>{
                        let uuid = await crypto.randomBytes(16).toString("hex");
                        let product_info = await product.findOne({_id:new ObjectId(param.product_id)})
                        value = {
                            product_id:new ObjectId(product_info._id),
                            order_hash:order_uuid,
                            id:uuid,
                            image:product_info.thumb,
                            title:product_info.title,
                            brand:product_info.brand,
                            category:product_info.category,
                            sub_category:product_info.sub_category,
                            quantity:param.qty,
                            size:param.size,
                            price:param.price,
                            grandTotal:param.total,
                            total:parseFloat(grandTotal),
                            address:address,
                            payment_type:"ONLINE",
                            payment_id:req.body['payment[razorpay_payment_id]'],
                            payment_status:"Paid",
                            status:"Pending",
                            date:date,
                            month:thisMonth,
                            arrive:arrive,
                            notes:data.notes
                        }
                        await orders.updateOne({user_id:new ObjectId(req.session.user_id)},{$push:{orders:value}})
                    })
                    let response = await carts.findOne({user_id:new ObjectId(req.session.user_id)})
                    await response.products.forEach(async (datas)=>{
                        let qty = parseInt(datas.quantity)
                        await product.updateOne({_id:new ObjectId(datas.product_id)},{$inc:{stocks:-qty}})
                    })
                    if(req.session?.discount){
                        await coupon.updateOne({code:req.session.discount.code},{$inc:{remaining:-1}})
                        req.session.discount = null
                    }
                    await carts.updateOne({user_id:new ObjectId(req.session.user_id)},{$unset:{"products":1}})
                    res.json({online:true})
                }
            }else{
                res.json({failed:true})
            }                 
        }catch(err){
            next()
        }
    },

    addressSelect:async (req, res, next)=>{
        try{
            let result = await users.findOne({_id:new ObjectId(req.session.user_id)})
            let address = result.address[req.params.id]
            req.session.address_select=address
            res.redirect("/checkout")
        }catch(err){
            next()
        }
    },

    removeAddress:async (req, res, next)=>{
        try{
            await users.updateOne({
                _id:new ObjectId(req.session.user_id)
            },{
                $pull:{
                    address:{
                        id:req.params.id
                    }
                }
            })
            res.redirect("/address_list")
        }catch(err){
            next()
        }
    },

    history:async (req, res, next)=>{
        try{
            let data = await orders.aggregate([
                {
                    $match:{
                        user_id:new ObjectId(req.session.user_id)
                    }
                },{
                    $unwind:"$orders"
                },{
                    $group:{
                        _id:"$orders.order_hash",
                        orders:{
                            $addToSet:"$$ROOT"
                        }
                    }
                },{
                    $sort:{
                        "orders.orders.date":-1
                    }
                }
            ]).toArray()
            let cwcount = await getCwcount(req.session.user_id)
            res.render("order_history",{title:"ORDER HISTORY",data,nofooter:true,cwcount})
        }catch(err){
            console.log(err);
            next()
        }
    },

    downloadInvoice:async (req, res)=>{
        try{
            let uid = req.params.id
            let order = await orders.aggregate([
                {
                    $match:{
                        user_id:new ObjectId(req.session.user_id),
                    }
                }
            ]).toArray()
            let orderData = []
            let grandTotal = 0
            order[0]?.orders?.forEach((data)=>{
                if(data.order_hash==uid && data.status!="Cancelled" && data.status!="Returned"){
                    orderData.push(data)
                    grandTotal += data.grandTotal
                }
            })
            let cwcount = await getCwcount(req.session.user_id)
            let user = await users.findOne({_id:new ObjectId(req.session.user_id)})
            res.render("invoice",{title:"INVOICE",orderData,nofooter:true,user_header:true,cwcount,grandTotal,user})
        }catch(err){
            next()
        }
    },

    cancelOrder:async (req, res, next)=>{
        try{
            let uuid = req.params.id
            let cancel_order = await orders.aggregate([
                {
                    $unwind:"$orders"
                },{
                    $match:{
                        "orders.id":uuid
                    }
                }
            ]).toArray()
            if(cancel_order){
                let payment_status = cancel_order[0]?.orders?.payment_status
                if(payment_status == "Paid"){
                    let cancelled_price = cancel_order[0]?.orders?.total
                    await users.updateOne({_id:new ObjectId(req.session.user_id)},{$inc:{balance:cancelled_price}})
                }
                await orders.updateOne({user_id:new ObjectId(req.session.user_id),"orders.id":uuid},{$set:{"orders.$.status":"Cancelled"}})
            }
            res.redirect("/my_orders")
        }catch(err){
            next()
        }
    },

    returnOrder:async (req, res, next)=>{
        try{
                let uuid = req.body.id
            let return_order = await orders.aggregate([
                {
                    $unwind:"$orders"
                },{
                    $match:{
                        "orders.id":uuid
                    }
                }
            ]).toArray()
            if(return_order){
                let payment_status = return_order[0]?.orders?.payment_status
                let order_status = return_order[0]?.orders?.status
                if(payment_status == "Paid" && order_status == "Confirmed"){
                    res.json({status:true,id:uuid})
                }
            }else{
                res.json({status:false})
            }
        }catch(err){
            next()
        }
    },

    returnOrderReason:async (req, res, next)=>{
        try{
            let data = req.body;
            let uuid = data.order_id
            let reason = data.reason
            let return_order = await orders.aggregate([
                {
                    $unwind:"$orders"
                },{
                    $match:{
                        "orders.id":uuid
                    }
                }
            ]).toArray()
            if(return_order){
                let payment_status = return_order[0]?.orders?.payment_status
                let order_status = return_order[0]?.orders?.status
                if(payment_status == "Paid" && order_status == "Confirmed"){
                    let return_price = return_order[0]?.orders?.total
                    await users.updateOne({_id:new ObjectId(req.session.user_id)},{$inc:{balance:return_price}})
                    await orders.updateOne({user_id:new ObjectId(req.session.user_id),"orders.id":uuid},{$set:{"orders.$.status":"Returned","orders.$.reason":reason}})
                }
            }
            res.redirect("/my_orders")
        }catch(err){
            next()
        }
    },

    checkCoupon:async (req, res, next)=>{
        try{
            let code = req.body.code
            let result = await coupon.findOne({code:code,status:"enabled",remaining:{$gt:0}})
            if(result==null){
                res.json({status:"not found"})
            }else{
                let to = result.to
                let now = Math.floor(new Date().getTime()/1000)
                if(to - now < 0){
                    await coupon.updateOne({code:code},{$set:{status:"expired"}})
                    res.json({status:"expired"})
                }else{
                    let cart = await carts.findOne({user_id:new ObjectId(req.session.user_id)})
                    if(cart.coupon!=code){
                        await carts.updateOne({user_id:new ObjectId(req.session.user_id)},{$set:{coupon:code}})
                    }
                    let grandTotal = await carts.aggregate([
                        {
                            $match:{
                                user_id:new ObjectId(req.session.user_id)
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
                    grandTotal = grandTotal[0].total;
                    discount = result.discount
                    disPrice = (grandTotal * discount / 100).toFixed(2)
                    if(disPrice>result.max_discount){
                        disPrice = (result.max_discount).toFixed(2)
                    }
                    totalPrice = (grandTotal - disPrice).toFixed(2)
                    req.session.discount = {
                        code:code,
                        discount:discount
                    }
                    res.json({status:true,disPrice:disPrice,totalPrice:totalPrice})
                }
            }
        }catch(err){
            next()
        }
    }

}