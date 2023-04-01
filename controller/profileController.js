const users = require("../model/userModel")
const carts = require("../model/cartModel")
const { default: mongoose } = require("mongoose")
const { ObjectId } = mongoose.Types
const wishlist = require("../model/wishlistModel")
const bcrypt = require("bcrypt")

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
    profile:async (req, res, next)=>{
        try{
            let cwcount = await getCwcount(req.session.user_id)
            let profile = await users.findOne({_id:new ObjectId(req.session.user_id)})
            let balance = profile?.balance ? (profile.balance).toFixed(2) : 0
            res.render("profile",{title:""+profile.first_name+" "+profile.last_name,nofooter:true,cwcount,profile,balance})
        }catch(err){
            next()
        }
    },

    editUser:async (req, res, next)=>{
        try{
            let data = req.body
            await users.updateOne({_id:new ObjectId(req.session.user_id)},{$set:{first_name:data.first_name,last_name:data.last_name,gender:data.gender}})
            res.redirect("/profile")
        }catch(err){
            next()
        }
    },

    change_password:async (req, res, next)=>{
        try{
            let cwcount = await getCwcount(req.session.user_id)
            res.render("change_password",{title:"CHANGE PASSWORD",nofooter:true,cwcount})
        }catch(err){
            next()
        }
    },

    change_user_password:async (req, res, next)=>{
        try{
            let current_password = req.query?.password
            let new_password = req.query?.new_password
            let data = await users.findOne({_id:new ObjectId(req.session.user_id)})
            let userPass = data.password
            if(current_password){
                let result = await bcrypt.compare(current_password,userPass)
                if(result){
                    res.json({status:"current"})
                }else{
                    res.json({status:"invalid"})
                }
            }
            if(new_password){
                let result = await bcrypt.compare(new_password,userPass)
                if(result){
                    res.json({status:"current"})
                }else{
                    res.json({status:"invalid"})
                }
            }   
        }catch(err){
            res.json({error:true})
        } 
    },

    change_user_password_post:async (req, res, next)=>{
        try{
            let password = req.body.changed_password
            let encryptPassword = await bcrypt.hash(password,10) 
            await users.updateOne({_id:new ObjectId(req.session.user_id)},{$set:{password:encryptPassword}})
            res.json("done")
        }catch(err){
            res.json({error:true})
        }
    }

}