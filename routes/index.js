const express = require('express');
const router = express.Router();
const nocache = require("nocache")
const userAuth = require("../middleware/userAuth")
const userController = require("../controller/userController")
const productController = require("../controller/productController");
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController');
const reviewController = require("../controller/reviewController");
const wishlistController = require('../controller/wishlistController');
const profileController = require("../controller/profileController")

router.get("/",nocache(),userController.home)

router.get("/signup",nocache(),userController.signup)

router.get("/login",nocache(),userController.login)
router.post("/login",userController.doLogin)

router.get("/shop",productController.getShop)

router.get("/product_details/:id",productController.getSingleProduct)

router.get("/cart",nocache(),userAuth.authentication,cartController.getCart)

router.get("/addtocart/:id",userAuth.authentication,cartController.addToCartWithId)
router.get("/addtocart/:id/:size",userAuth.authentication,cartController.addToCartWithSize)

router.get("/remove_cart/:product_id/:size",nocache(),userAuth.authentication,cartController.deleteFromCart)

router.get("/checkout",nocache(),userAuth.authentication,orderController.cartCheckout)

router.get("/success",nocache(),userAuth.authentication,orderController.orderSuccess)

router.get("/wishlist",nocache(),userAuth.authentication,wishlistController.getWishlist)

router.get("/addtowishlist/:id",nocache(),userAuth.authentication,wishlistController.addtowishlistById)
router.get("/addtowishlist/:id/:size",nocache(),userAuth.authentication,wishlistController.addtowishlistBySize)

router.get("/remove_wishlist/:id/:size",nocache(),userAuth.authentication,wishlistController.remove_wishlist)

router.get("/toCart/:id/:size",nocache(),userAuth.authentication,wishlistController.toCart)

router.get("/profile",nocache(),userAuth.authentication,profileController.profile)
router.post("/profile",userAuth.authentication,profileController.editUser)

router.get("/address_list",userAuth.authentication,userController.userInfo)

router.get("/forgot_password",nocache(),userController.forgotPassword)

router.get("/setPassword",nocache(),userController.setPassword)

router.get("/address-select/:id",nocache(),userAuth.authentication,orderController.addressSelect)

router.get("/my_orders",nocache(),userAuth.authentication,orderController.history)

router.get("/cancel-order/:id",userAuth.authentication,orderController.cancelOrder)

router.get("/logout",userAuth.authentication,userController.logout)

router.get("/remove-address/:id",nocache(),userAuth.authentication,orderController.removeAddress)

router.get("/change_password",nocache(),userAuth.authentication,profileController.change_password)

router.get("/post-review/:id",nocache(),userAuth.authentication,productController.reviewPage)

router.get("/show-reviews/:id",reviewController.showAllReviews)

router.post("/return-order",userAuth.authentication,orderController.returnOrderReason)

router.get("/download-invoice/:id",userAuth.authentication,orderController.downloadInvoice)

router.get("/about",userController.about)

router.get("/contact",nocache(),userController.contact)

//ajax request part

router.post("/add_qty",userAuth.authentication,cartController.updateQty)

router.post("/changeShopContents",productController.getShopPost)

router.get("/emailExist",nocache(),userController.emailExist)

// router.post("/sendOtp",userController.sendOtp)

router.post("/validateOtp",nocache(),userController.validateOtp)

router.get("/checkCurrentPassword",nocache(),userController.checkCurrentPassword)

router.post("/reset_password",nocache(),userController.reset_password)

router.post("/success",userAuth.authentication,orderController.checkoutData)

router.post("/verify-payment",orderController.verifyPayment)

router.post("/getSearchProducts",nocache(),productController.searchResult)

router.get("/change_user_password",nocache(),userAuth.authentication,profileController.change_user_password)

router.post("/change_user_password",userAuth.authentication,profileController.change_user_password_post)

router.post("/checkCoupon",userAuth.authentication,orderController.checkCoupon)

router.post("/postRating",userAuth.authentication,reviewController.postRating)
router.post("/postReview",userAuth.authentication,reviewController.postReview)

router.post("/contact",userController.contactPost)

router.post("/reviewsSort",reviewController.reviewsSort)

router.post("/returnOrder",userAuth.authentication,orderController.returnOrder)

router.post("/verifySignup",userController.verifySignup)

router.post("/signupOtpCheck",userController.signupOtpCheck)

router.post("/removeCoupon",userAuth.authentication,orderController.removeCoupon)

module.exports = router;
