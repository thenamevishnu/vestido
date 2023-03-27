const users = require("../model/userModel")
const carts = require("../model/cartModel")
const bcrypt = require("bcrypt")
const { default: mongoose } = require("mongoose")
const { ObjectId } = mongoose.Types
const sendMail = require("./mailController")
const wishlist = require("../model/wishlistModel")
const hash = require("sha256")
const product = require("../model/productModel")

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

    home:async (req, res, next)=>{
        try{
            let cwcount = await getCwcount(req.session.user_id) ?? 0
            let latest = await product.find().sort({_id:-1}).limit(3).toArray()
            res.render("index", { title: "HOME",cwcount,latest})
        }catch(err){
            next()
        }
    },

    signup:async (req, res, next)=>{
        try{
            if(req.session.loggedIn){
                res.redirect("/")
            }else{
                let cwcount = await getCwcount(req.session.user_id) ?? 0
                err = req.session.err
                verify = req.session.verify
                userData = req.session.userData
                res.render("signup",{title:"Register",err,userData,nofooter:true,cwcount,verify})
                req.session.err = null
                req.session.userData = null
                req.session.verify = null
            }
        }catch(err){
            next()
        }
    },

    verifySignup:async (req, res, next)=>{
        try{
            let data = req.body; 
            let checkUsername = new RegExp(data.username,"i")
            let usernameExist = await users.findOne({username:{$regex:checkUsername}})
            if(usernameExist){
                res.json({status:false,err:"username"})
            }else{
                let checkEmail = new RegExp(data.email,"i")
                let emailExist = await users.findOne({email:{$regex:checkEmail}})
                if(emailExist){
                    res.json({status:false,err:"email"})
                }else{
                    let phoneExist = await users.findOne({phone:data.phone})
                    if(phoneExist){
                        res.json({status:false,err:"phone"})
                    }else{
                        function otp(length){
                            let result = "";
                            const string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                            const len = string.length;
                            let counter = 0;
                            while (counter < length) {
                                result += string.charAt(Math.floor(Math.random() * len));
                                counter += 1;
                            }
                            return result;
                        }
                        let sent = otp(10)
                        let response = await sendMail.sendOtp(data.email,sent)
                        if(response=="sent"){
                            req.session.otp = sent
                            req.session.email = data.email
                            let sentTime = Math.floor(new Date().getTime()/1000)
                            req.session.sendTime = sentTime
                            res.json({status:true})
                        }else{
                            res.json({status:false})
                        }
                    }
                }
            }
            
        }catch(err){
            next()
        }
    },

    signupOtpCheck:async (req, res, next)=>{
        try{
            let data = req.body
            let otp = req.session.otp
            let enteredOtp = data.otp
            let now = Math.floor(new Date().getTime()/1000)
            let sentTime = req.session.sentTime
            if(otp != enteredOtp || now-sentTime > 300){
                if(now-sentTime > 300){
                    req.session.sentTime = null
                    req.session.otp = null
                    res.json({status:false,err:"timeout"})
                }
                res.json({status:false,err:"invalid"})
            }else{
                req.session.otp = null
                let encryptPassword = await bcrypt.hash(data.password,10)
                let insertId = await users.insertOne(
                    {
                        first_name:data.first_name,
                        last_name:data.last_name,
                        username:data.username,
                        email:data.email,
                        phone:data.phone,
                        password:encryptPassword,
                        verified:0,
                        gender:"not-prefered"
                    })
                req.session.user_id = insertId.insertedId
                req.session.loggedIn = true
                console.log(req.session);
                res.json({status:true})
            }
        }catch(err){
            next()
        }
    },

    login:async (req, res, next)=>{
        try{
            if(req.session.loggedIn){
                res.redirect("/")
            }else{
                let cwcount = await getCwcount(req.session.user_id) ?? 0
                err = req.session.err
                userData = req.session.userData
                banned = req.session.banned
                verify = req.session.verify
                res.render("login",{title:"Login",err,userData,nofooter:true,cwcount,banned,verify})
                req.session.banned = null
                req.session.err = null
                req.session.userData = null
                req.session.verify = null
            }
        }catch(err){
            next()
        }
    },

    doLogin:async (req, res, next)=>{
        try{
            const userData = req.body
            let emailExist = await users.findOne({email:userData.email})
            if(emailExist){
                let result = await bcrypt.compare(userData.password,emailExist.password)
                if(!result){
                    req.session.err = {password:"Invalid Login Info"}
                    req.session.userData = userData
                    res.redirect("/login")
                }else{
                    if(result.blocked){
                        req.session.err = {email:"Blocked/Banned account!"}
                        req.session.userData = userData
                        res.redirect("/login")
                    }else{
                        req.session.user_id = emailExist._id
                        req.session.loggedIn = true
                        if(req.session?.next){
                            let nextPath = req.session.next
                            req.session.next = null
                            res.redirect(nextPath)
                        }else{
                            res.redirect("/")
                        }
                    }
                }
            }else{
                req.session.err = {password:"Invalid Login Info"}
                req.session.userData = userData
                res.redirect("/login")
            }
        }catch(err){
            next()
        }
    },

    userInfo:async (req, res, next)=>{
        try{
            let user = await users.findOne({_id:new ObjectId(req.session.user_id)})
            let address = user.address;
            if(address?.length==0){
                res.redirect("/shop")
            }else{
                let cwcount = await getCwcount(req.session.user_id)
                res.render("address",{title:"SAVED ADDRESS",nofooter:true,cwcount,address})
            }
        }catch(err){
            next()
        }
    },

    forgotPassword:async (req, res, next)=>{
        try{
            if(req.session.loggedIn){
                res.redirect("/")
            }else{
                let cwcount = await getCwcount(req.session.user_id) ?? 0
                res.render("forgot",{title:"Forgot Password",nofooter:true,cwcount})
            }
        }catch(err){
            next()
        }
    },

    validateOtp:async (req, res, next)=>{
        try{
            let otp = req.session.otp
            let enteredOtp = req.body.otp
            let now = Math.floor(new Date().getTime()/1000)
            let sentTime = req.session.sentTime
            if(otp != enteredOtp || now-sentTime > 300){
                req.session.sentTime = null
                req.session.otp = null
                res.json(false)
            }else{
                req.session.otp = null
                let time = new Date().getTime()
                genratedKey = hash(""+time+"")
                req.session.forgotKey = genratedKey
                res.json(genratedKey)
            }
        }catch(err){
            next()
        }
    },

    setPassword:async (req, res, next)=>{
        try{
            if(!req.session?.forgotKey){
                res.redirect("/login")
            }
            if(req.session.email && req.session.forgotKey){
                req.session.forgotKey = null
                let cwcount = await getCwcount(req.session?.user_id)
                res.render("setpassword",{title:"Forgot Password",nofooter:true,cwcount})
            }
        }catch(err){
            next()
        }
    },

    reset_password:async (req, res, next)=>{
        try{
            let password = req.body.password
            let encryptPassword = await bcrypt.hash(password,10) 
            await users.updateOne({email:req.session.email},{$set:{password:encryptPassword}})
            req.session.email = null
            res.json("done")
        }catch(err){
            next()
        }
    },

    emailExist:async (req, res, next)=>{
        try{
            let data = await users.findOne({email:req.query.email})
            if(!data){
                res.json("notexist")
            }else{
                function otp(length){
                    let result = "";
                    const string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                    const len = string.length;
                    let counter = 0;
                    while (counter < length) {
                        result += string.charAt(Math.floor(Math.random() * len));
                        counter += 1;
                    }
                    return result;
                }
                let sent = otp(10)
                let response = await sendMail.sendOtp(req.query.email,sent)
                if(response=="sent"){
                    req.session.otp = sent
                    req.session.email = req.query.email
                    res.json("sent")
                }else{
                    res.json("error")
                }
            }
        }catch(err){
            next()
        }
    },

    checkCurrentPassword:async (req, res, next)=>{
        try{
            let password = req.query.password
            let email = req.session.email
            let data = await users.findOne({email:email})
            let userPass = data.password
            let result = await bcrypt.compare(password,userPass)
            if(result){
                res.json("exist")
            }else{
                res.json("notexist")
            }
        }catch(err){
            next()
        }
    },

    logout:async (req, res, next)=>{
        try{
            req.session.loggedIn = null
            req.session.user_id = null
            res.redirect("/login")
        }catch(err){
            next()
        }
    },

    sendOtp:async (req, res, next)=>{
        try{
            let email = req.body.email
            let otp = req.body.otp
            let result = await sendOtp(email,otp)
            if(result=="sent"){
                let sentTime = Math.floor(new Date().getTime()/1000)
                req.session.email = email
                req.session.otp = otp
                req.session.sendTime = sentTime
                res.json(true)
            }else{
                res.json(false)
            }
        }catch(err){
            next()
        }
    },

    about:async (req, res, next)=>{
        try{
            let cwcount = await getCwcount(req.session.user_id) 
            res.render("about",{title:"ABOUT",cwcount})
        }catch(err){
            next()
        }
    },

    contact:async (req, res, next)=>{
        try{
            let cwcount = await getCwcount(req.session.user_id) 
            res.render("contact",{title:"GET IN TOUCH",cwcount})
        }catch(err){
            next()
        }
    },

    contactPost:async (req, res, next)=>{
        try{
            let result = await sendMail.sendMessage(req.body)
            if(result=="sent"){
                res.json({status:true})
            }else{
                res.json({status:false})
            }   
        }catch(err){
            next()
        }
    }
}