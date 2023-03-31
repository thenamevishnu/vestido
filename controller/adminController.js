const { default: mongoose } = require("mongoose")
const { ObjectId } = mongoose.Types
const admins = require("../model/adminModel")
const user = require("../model/userModel")
const product = require("../model/productModel")
const categories = require("../model/categoryModel")
const orders = require("../model/orderModel")
const coupon = require("../model/couponModel")
const cloudinary = require("cloudinary").v2
require("dotenv")
const fs = require("fs")

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

module.exports = {
    dashboard:async (req, res, next)=>{
        try{
            let productCount = await product.estimatedDocumentCount() ?? 0
            let order = await orders.find().toArray()
            let orderCount = 0
            let cancelled = 0
            let pending = 0
            let totalProfit = 0
            let totalRevenue = 0
            let returned = 0
            order.forEach(obj=>{
                if(obj?.orders){
                    obj.orders.forEach(data=>{
                        if(data.status == "Cancelled"){
                            cancelled++
                        }
                        if(data.status == "Pending"){
                            pending++
                        }
                        if(data.status == "Returned"){
                            returned++
                        }
                        totalRevenue += data.grandTotal
                        totalProfit += data.grandTotal * 1/5
                    })
                    orderCount += obj?.orders?.length
                }
            })
            console.log(totalRevenue);
            let totalUsers = await user.estimatedDocumentCount()
            let data = {
                productCount:productCount,
                orderCount:orderCount,
                cancelled:cancelled,
                pending:pending,
                returned:returned,
                totalProfit:totalProfit.toFixed(2),
                totalRevenue:totalRevenue.toFixed(2),
                totalUsers:totalUsers
            }
            res.render("admin/dashboard",{title:"Dashboard",admin:true,header:"ADMIN",data})
        }catch(err){
            next()
        }
    },

    chartData:async (req, res, next)=>{
        try{
            let order = await orders.aggregate([
                {
                    $unwind:"$orders"
                },{
                    $group:{
                        _id:"$orders.month",
                        grandTotal:{
                            $sum:"$orders.grandTotal"
                        }
                    }
                },{
                    $sort:{
                        _id:1
                    }
                }
            ]).toArray()
            res.json(order)
        }catch(err){
            next()
        }
    },

    login:(req, res, next)=>{
        try{
            if(req.session.adminLogged){
                res.redirect("/admins")
            }else{
                err = req.session.admin_err
                adminData = req.session.adminData
                res.render("admin/login",{title:"ADMIN LOGIN",err,adminData,admin:true,header:"ADMIN LOGIN"})
                req.session.admin_err = null
                req.session.adminData = null
            }
        }catch(err){
            next()
        }
    },

    doLogin:async (req, res, next)=>{
        try{
            let data = req.body
            let response = await admins.findOne({email:data.email,password:data.password})
            if(response){
                req.session.adminLogged=true
                req.session.admin_id = response._id
                res.redirect("/admins")
            }else{
                req.session.admin_err = {password:"Invalid Login Info"}
                req.session.adminData = data
                res.redirect("/admins/login")
            }
        }catch(err){
            next()
        }
    },

    getAllUsers:async (req, res, next)=>{
        try{
            let users = await user.find().toArray()
            res.render("admin/users",{title:"Users Management",users,admin:true,header:"USERS",logged:true})
        }catch(err){
            next()
        }
    },

    deleteUser:async (req, res, next)=>{
        try{
            const id = req.params.id
            await user.deleteOne({_id:new ObjectId(id)})
            res.redirect("/admins/users")
        }catch(err){
            next()
        }
    },

    blockUser:async (req, res, next)=>{
        try{
            const id = req.params.id
            await user.updateOne({_id:new ObjectId(id)},{$set:{blocked:1}})
            res.redirect("/admins/users")
        }catch(err){
            next()
        }
    },

    unBlockUser:async (req, res, next)=>{
        try{
            const id = req.params.id
            await user.updateOne({_id:new ObjectId(id)},{$set:{blocked:0}})
            res.redirect("/admins/users")
        }catch(err){
            next()
        }
    },

    getAllProducts:async (req, res, next)=>{
        try{
            let products = await product.find().toArray()
            res.render("admin/products",{title:"PRODUCT MANAGEMENT",products,admin:true,header:"PRODUCTS",logged:true})
        }catch(err){
            next()
        }
    },

    addProduct:async (req, res, next)=>{
        try{
            err = req.session.admin_err
            data = req.session.adminData
            let category = await categories.find().toArray()
            res.render("admin/add_products",{title:"ADD PRODUCTS",admin:true,header:"ADD PRODUCTS",logged:true,err,data,category})
            req.session.admin_err=null
            req.session.adminData=null
        }catch(err){
            next()
        }
    },

    addProductPost:async (req, res, next)=>{ 
        try{
            console.log("hi");
            let data = req.body
            let files = req.files
            const price = parseFloat(data.price)
            const stocks = parseInt(data.stocks)
            if(!Array.isArray(files.file) || files.file.length<2 || files.file.length>5){
                req.session.admin_err = {file:"Minimum 2 files and maximum 5 files!"}
                req.session.adminData = data
                res.redirect("/admins/add_products")
            }else{
                var image = []
                await files.file.forEach(file => {
                    var splited = file.name.split(".")
                    var ext = splited[splited.length-1]
                    file.mv(__dirname+"/../public/images/products/"+file.md5+"."+ext+"",(err)=>{
                        if(err){
                            req.session.admin_err = {file:"File Upload Failed!"}
                            req.session.adminData = data
                            res.redirect("/admins/add_products")
                        }
                    })
                    image.push(""+file.md5+"."+ext+"")
                })
                image.forEach(images=>{
                    let public_name = images.split(".")[0] 
                    console.log("1");
                    cloudinary.uploader.upload(__dirname+"/../public/images/products/"+images,{public_id:public_name}).then(result=>{
                        console.log(result);
                         fs.unlink(__dirname+"/../public/images/products/"+images,(err)=>{
                            if(err){
                                req.session.admin_err = {file:"File Upload Failed!"}
                                req.session.adminData = data
                                res.redirect("/admins/add_products")
                            }  
                         })
                    })
                })
                size = []
                if(data.size_sm=="on"){ size.push("S") }else{ size.push("") }
                if(data.size_md=="on"){ size.push("M") }else{ size.push("") }
                if(data.size_lg=="on"){ size.push("L") }else{ size.push("") }
                if(data.size_xl=="on"){ size.push("XL") }else{ size.push("") }
                if(data.size_xxl=="on"){ size.push("XXL") }else{ size.push("") }
                await product.insertOne({thumb:image[0],photo:image,title:data.title,description:data.description,price:price,brand:data.brand,category:data.category,sub_category:data.sub_category,stocks:stocks,size:size})
                res.redirect("/admins/products")
            }
        }catch(err){
            next()
        }
    },

    deleteProduct:async (req, res, next)=>{
        try{
            await product.deleteOne({_id:new ObjectId(req.params.id)})
            res.redirect("/admins/products")
        }catch(err){
            next()
        }
    },
    
    editProduct:async (req, res, next)=>{
        try{
            let data = await product.findOne({_id:new ObjectId(req.params.id)})
            if(data.photo.length >= 5){
                show=false
            }else{
                show=true
            }
            err = req.session.admin_err
            category = await categories.find().toArray()
            res.render("admin/edit_product",{title:"EDIT PRODUCT",admin:true,header:"EDIT PRODUCT",logged:true,data,show,err,category})
            req.session.admin_err=null
        }catch(err){
            next()
        }
    },

    editProductPost:async (req, res, next)=>{
        try{
            let image;
            let data = req.body
            let id = req.params.id
            let files = req.files
            const price = parseFloat(data.price)
            const stocks = parseInt(data.stocks)
            let productInfo = await product.findOne({_id:new ObjectId(id)})
            image = productInfo.photo
            total = image.length
            if(files!=null){
                if(files.file.length==undefined && files.file.name){
                    let file = files.file
                    let splited = file.name.split(".")
                    let ext = splited[splited.length-1]
                    file.mv(__dirname+"/../public/images/products/"+file.md5+"."+ext+"",(err)=>{
                        if(err){
                            req.session.admin_err = {file:"File upload failed!"}
                            res.redirect("/admins/edit_product/"+id+"")
                        }
                    })
                    image.push(""+file.md5+"."+ext+"")
                }

                if(files.file.length > 1 && files.file.length<=5-total){
                    await files.file.forEach(file => {
                        let splited = file.name.split(".")
                        let ext = splited[splited.length-1]
                        file.mv(__dirname+"/../public/images/products/"+file.md5+"."+ext+"",(err)=>{
                            if(err){
                                req.session.admin_err = {file:"File upload failed!"}
                                res.redirect("/admins/edit_product/"+id+"")
                            }
                        })
                        image.push(""+file.md5+"."+ext+"")
                    })
                }
                if(files.file.length+total>5){
                    req.session.admin_err = {file:"You can't add more than 5 images!"}
                    res.redirect("/admins/edit_product/"+id+"")
                }
                image.forEach(images=>{
                    let public_name = images.split(".")[0]
                    cloudinary.uploader.upload(__dirname+"/../public/images/products/"+images,{public_id:public_name}).then(result=>{
                         fs.unlink(__dirname+"/../public/images/products/"+images,(err)=>{
                            if(err){
                                req.session.admin_err = {file:"File Upload Failed!"}
                                req.session.adminData = data
                                res.redirect("/admins/add_products")
                            } 
                         })
                    })
                })
                size = []
                if(data.size_sm=="on"){ size.push("S") }else{ size.push("") }
                if(data.size_md=="on"){ size.push("M") }else{ size.push("") }
                if(data.size_lg=="on"){ size.push("L") }else{ size.push("") }
                if(data.size_xl=="on"){ size.push("XL") }else{ size.push("") }
                if(data.size_xxl=="on"){ size.push("XXL") }else{ size.push("") }
                await product.updateOne({_id:new ObjectId(id)},{$set:{thumb:image[0],photo:image,title:data.title,description:data.description,price:price,brand:data.brand,category:data.category,sub_category:data.sub_category,stocks:stocks,size:size}})
                res.redirect("/admins/products")
            }else{
                size = []
                if(data.size_sm=="on"){ size.push("S") }else{ size.push("") }
                if(data.size_md=="on"){ size.push("M") }else{ size.push("") }
                if(data.size_lg=="on"){ size.push("L") }else{ size.push("") }
                if(data.size_xl=="on"){ size.push("XL") }else{ size.push("") }
                if(data.size_xxl=="on"){ size.push("XXL") }else{ size.push("") }
                await product.updateOne({_id:new ObjectId(id)},{$set:{title:data.title,description:data.description,price:price,brand:data.brand,category:data.category,sub_category:data.sub_category,stocks:stocks,size:size}})
                res.redirect("/admins/products")
            }
        }catch(err){
            next()
        }
    },

    deleteImage:async (req, res, next)=>{
        try{
            let result = await product.findOne({_id:new ObjectId(req.params.id)})
            if(result.photo.length==2){
                req.session.admin_err = {img:"Delete faild! Need minimum 2 images"}
                res.redirect("/admins/edit_product/"+req.params.id+"")
            }else{
                await product.updateOne({_id:new ObjectId(req.params.id)},{$pull:{photo:{$in:[req.params.del]},photo:req.params.del}})
                res.redirect("/admins/edit_product/"+req.params.id+"")
            }
        }catch(err){
            next()
        }
    },

    getAllCategory:async (req, res, next)=>{
        try{
            let category = await categories.find().toArray()
            res.render("admin/category",{title:"CATEGORY MANAGEMENT",category,admin:true,header:"CATEGORY",logged:true})
        }catch(err){
            next()
        }
    },

    addCategory:async (req, res, next)=>{
        try{
            data = req.session.adminData
            err = req.session.admin_err
            res.render("admin/add_category",{title:"ADD CATEGORY",admin:true,header:"ADD CATEGORY",logged:true,err,data})
            req.session.adminData = null
            req.session.admin_err = null
        }catch(err){
            next()
        }
    },
    
    addCategoryPost:async (req, res, next)=>{
        try{
            let data = req.body
            const sub = data.sub_category.split(",")
            const reg = new RegExp(data.category,"i")
            let result = await categories.findOne({category:{$regex:reg}})
            if(result){
                req.session.admin_err = {category:"Category already exist!"}
                req.session.adminData = data
                res.redirect("/admins/add_category")
            }else{
                await categories.insertOne({category:data.category,sub_category:sub,status:true})
                res.redirect("/admins/category")
            }
        }catch(err){
            next()
        }
    },

    disableCategory:async (req, res, next)=>{
        try{
            await categories.updateOne({_id:new ObjectId(req.params.id)},{$set:{status:false}})
            res.redirect("/admins/category")
        }catch(err){
            next()
        }
    },

    enableCategory:async (req, res, next)=>{
        try{
            await categories.updateOne({_id:new ObjectId(req.params.id)},{$set:{status:true}})
            res.redirect("/admins/category")
        }catch(err){
            next()
        }
    },

    editCategory:async (req, res, next)=>{
        try{
            let data = await categories.findOne({_id:new ObjectId(req.params.id)})
            err = req.session.admin_err
            res.render("admin/edit_category",{title:"EDIT CATEGORY",admin:true,header:"EDIT CATEGORY",logged:true,err,data})
            req.session.admin_err = null
        }catch(err){
            next()
        }
    },

    editCategoryPost:async (req, res, next)=>{
        try{
            let data = req.body
            let id = req.params.id
            const sub = data.sub_category.split(",")
            const reg = new RegExp(data.category,"i")
            let result = await categories.findOne({category:{$regex:reg}})
            if(result && result._id!=id){
                req.session.admin_err = {category:"Category already exist!"}
                res.redirect("/admins/edit_category/"+id+"")
            }else{
                await categories.updateOne({_id:new ObjectId(id)},{$set:{category:data.category,sub_category:sub}})
                res.redirect("/admins/category")
            }
        }catch(err){
            next()
        }
    },

    salesReport:async (req, res, next)=>{
        try{
            let filter = req.session?.adminFilter
            let order
            if(!filter){
                order = await orders.aggregate([
                {
                    $lookup:{
                        from:"users",
                        localField:"user_id",
                        foreignField:"_id",
                        as:"user_info"
                    }
                },{
                    $unwind:"$orders"
                },{
                    $match:{
                        "orders.payment_status":"Paid"
                    }
                }]).toArray()
            }else{
                order = filter
            }
            let selected = req.session.admin_filter
            let selected_date = {from:req.session.admin_from,to:req.session.admin_to}
            res.render("admin/sales_report",{title:"SALES REPORT",admin:true,header:"SALES REPORT",logged:true,order,selected,selected_date})
        }catch(err){
            next()
        }
    },

    salesReportPost:async (req, res, next)=>{
        try{
            let filter = req.body?.filter
            let from = req.body?.from
            let to = req.body?.to
            let obj = []
            let order = await orders.aggregate([
                {
                    $lookup:{
                        from:"users",
                        localField:"user_id",
                        foreignField:"_id",
                        as:"user_info"
                    }
                },{
                    $unwind:"$orders"
                },{
                    $match:{
                        "orders.payment_status":"Paid"
                    }
                }]).toArray()
            if(filter=="daily"){
                if(order.length>0){
                    req.session.admin_filter = "daily"
                    order.forEach(data=>{
                        let d = new Date()
                        today = d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
                        let d2 = new Date((data.orders.date)*1000)
                        check = d2.getDate()+"-"+(d2.getMonth()+1)+"-"+d2.getFullYear();
                        if(today==check){
                            obj.push(data)
                        }
                    })
                }
            }else if(filter=="monthly"){
                if(order.length>0){
                    req.session.admin_filter = "monthly"
                    order.forEach(data=>{
                        let d = new Date()
                        today = (d.getMonth()+1)+"-"+d.getFullYear();
                        let d2 = new Date((data.orders.date)*1000)
                        check = (d2.getMonth()+1)+"-"+d2.getFullYear();
                        if(today==check){
                            obj.push(data)
                        }
                    })
                }
            }else if(filter=="yearly"){
                if(order.length>0){
                    order.forEach(data=>{
                        req.session.admin_filter = "yearly"
                        let d = new Date()
                        today = d.getFullYear();
                        let d2 = new Date((data.orders.date)*1000)
                        check = d2.getFullYear();
                        if(today==check){
                            obj.push(data)
                        }
                    })
                }
            }else if(from && to){
                if(order.length>0){
                    req.session.admin_from = from
                    req.session.admin_to = to
                    order.forEach(data=>{
                        const d = new Date(data.orders.date * 1000)
                        const month = d.getMonth() + 1 < 10 ? "0"+(d.getMonth()+1) : (d.getMonth()+1)
                        const day = d.getDate() < 10 ? "0"+d.getDate() : d.getDate()
                        const date = d.getFullYear()+"-"+month+"-"+day
                        console.log(from, to , date);
                        if(date>=from && date<=to){
                            
                            obj.push(data)
                        }
                    })
                }
            }else{
                req.session.admin_filter = "all"
                obj = order
            }
            if(!from && !to){
                req.session.admin_from = null
                req.session.admin_to = null
            }
            req.session.adminFilter = obj
            res.json({status:true})
        }catch(err){
            next()
        }
    },

    orders:async (req, res, next)=>{
        try{
            let order = await orders.aggregate([
                {
                    $unwind:"$orders"
                }
            ]).toArray()
            console.log(order);
            res.render("admin/orders",{title:"ORDERS",admin:true,header:"ORDERS",logged:true,order})
        }catch(err){
            next()
        }
    },

    singleOrder:async (req, res, next)=>{
        try{
            let param = req.params.id.split("-")
            let user_id = param[0]
            let order_id = param[1]
            let order = await orders.aggregate([
                {
                    $unwind : "$orders"
                },{
                    $match:{
                        user_id:new ObjectId(user_id),
                        "orders.id":order_id
                    }
                }
            ]).toArray()
            res.render("admin/single-order",{title:"SINGLE VIEW",admin:true,header:"SINGLE ORDER",logged:true,order})
        }catch(err){
            next()
        }
    },

    changeOrderStatus:async (req, res, next)=>{
        try{
            let data = req.body
            let status = data.status
            let user_id = data.user_id
            let id = data.order_id
            if(status=="Cancelled"){
                let cancel_order = await orders.aggregate([
                    {
                        $unwind : "$orders"
                    },{
                        $match:{
                            user_id:new ObjectId(user_id),
                            "orders.id":id
                        }
                    }
                ]).toArray()
                if(cancel_order){
                    let payment_status = cancel_order[0]?.orders?.payment_status
                    if(payment_status == "Paid"){
                        let cancelled_price = cancel_order[0]?.orders?.total
                        await users.updateOne({_id:new ObjectId(user_id)},{$inc:{balance:cancelled_price}})
                    }
                }
            }
            if(status=="Confirmed"){
                let check = await orders.aggregate([
                    {
                        $unwind : "$orders"
                    },{
                        $match:{
                            user_id:new ObjectId(user_id),
                            "orders.id":id
                        }
                    }
                ]).toArray()
                if(check[0]?.orders?.payment_type == "COD"){
                    await orders.updateOne({user_id:new ObjectId(user_id),"orders.id":id},{$set:{"orders.$.status":status,"orders.$.payment_status":"Paid","orders.$.payment_id":"COD - CASH"}})
                }else{
                    await orders.updateOne({user_id:new ObjectId(user_id),"orders.id":id},{$set:{"orders.$.status":status}})
                }
            }else{
                await orders.updateOne({user_id:new ObjectId(user_id),"orders.id":id},{$set:{"orders.$.status":status}})
            }
            console.log(data);
            res.json({status:true})
        }catch(err){
            next()
        }
    },

    coupons:async (req, res, next)=>{
        try{
            let coupons = await coupon.find().toArray()
            coupons.forEach(async (data)=>{
                now = Math.floor(new Date().getTime()/1000)
                if(data.to - now <= 0){
                    await coupon.updateOne({_id:new ObjectId(data._id)},{$set:{status:"expired"}})
                }
            })
            coupons = await coupon.find().toArray()
            res.render("admin/coupons",{title:"COUPONS",admin:true,header:"COUPONS",logged:true,coupons})
        }catch(err){
            next()
        }
    },

    addCoupons:async (req, res, next)=>{
        try{
            data = req.session.adminData
            err = req.session.admin_err
            res.render("admin/add-coupon",{title:"ADD COUPON",admin:true,header:"ADD COUPON",logged:true,err,data})
            req.session.adminData = null
            req.session.admin_err = null
        }catch(err){
            next()
        }
    },

    addCouponsPost:async (req, res, next)=>{
        try{
            let data = req.body
            let code = data.code.toUpperCase()
            let discount = parseFloat(data.discount)
            let from = Math.floor(new Date(data.start).getTime()/1000)
            let to = Math.floor(new Date(data.expire).getTime()/1000)
            let now = Math.floor(new Date().getTime()/1000)
            let stocks = parseInt(data.stocks)
            let min_purchase = parseFloat(data.min_amount)
            let max_discount = parseFloat(data.max_amount)
            let status
            if(from>now){
                status = "pending"
            }else{
                status = "enabled"
            }
            let obj = {
                    code : code,
                    discount : discount,
                    min_purchase:min_purchase,
                    max_discount:max_discount,
                    from : from,
                    to : to,
                    status : status,
                    stocks : stocks,
                    remaining : stocks
                }
            await coupon.insertOne(obj)
            res.redirect("/admins/coupons")
        }catch(err){
            next()
        }
    },

    disableCoupon:async (req, res, next)=>{
        try{
            let id = req.params.id
            await coupon.updateOne({_id:new ObjectId(id),status:{$ne:"expired"}},{$set:{status:"disabled"}})
            res.redirect("/admins/coupons")
        }catch(err){
            next()
        }
    },

    enableCoupon:async (req, res, next)=>{
        try{
            let id = req.params.id
            await coupon.updateOne({_id:new ObjectId(id),status:{$ne:"expired"}},{$set:{status:"enabled"}})
            res.redirect("/admins/coupons")
        }catch(err){
            next()
        }
    },

    deleteCoupon:async (req, res, next)=>{
        try{
            let id = req.params.id
            await coupon.deleteOne({_id:new ObjectId(id)})
            res.redirect("/admins/coupons")
        }catch(err){
            next()
        }
    },

    editCoupon:async (req, res, next)=>{
        try{
            let id = req.params.id
            let data = await coupon.findOne({_id:new ObjectId(id)})
            err = req.session.admin_err
            res.render("admin/edit-coupon",{title:"EDIT COUPON",admin:true,header:"EDIT COUPON",logged:true,err,data})
            req.session.admin_err = null
        }catch(err){
            next()
        }
    },

    editCouponPost:async (req, res, next)=>{
        try{
            let data = req.body
            let code = data.code.toUpperCase()
            let discount = parseFloat(data.discount)
            let from = Math.floor(new Date(data.start).getTime()/1000)
            let to = Math.floor(new Date(data.expire).getTime()/1000)
            let now = Math.floor(new Date().getTime()/1000)
            let stocks = parseInt(data.stocks)
            let min_purchase = parseFloat(data.min_amount)
            let max_discount = parseFloat(data.max_amount)
            let status
            if(from>now){
                status = "pending"
            }else{
                status = "enabled"
            }
            let obj = {
                    code : code,
                    discount : discount,
                    min_purchase:min_purchase,
                    max_discount:max_discount,
                    from : from,
                    to : to,
                    status : status,
                    stocks : stocks,
                    remaining : stocks
                }
            await coupon.updateOne({_id:new ObjectId(req.params.id)},{$set:obj})
            res.redirect("/admins/coupons")
        }catch(err){
            next()
        }
    },

    logout:(req, res, next)=>{
        try{
            req.session.adminLogged=null
            req.session.admin_id=null
            res.redirect("/admins/login")
        }catch(err){
            next()
        }
    }

}