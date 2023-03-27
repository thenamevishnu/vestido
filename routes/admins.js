const express = require('express');
const router = express.Router();
const nocache = require("nocache");
const adminAuth = require("../middleware/adminAuth")
const adminController = require("../controller/adminController")


router.get('/', nocache(), adminAuth.authentication , adminController.dashboard)

router.get("/login",nocache(),adminController.login)
router.post("/login",adminController.doLogin)

router.get("/users",nocache(),adminAuth.authentication,adminController.getAllUsers)

router.get("/delete_user/:id",nocache(),adminAuth.authentication,adminController.deleteUser)

router.get("/block_user/:id",nocache(),adminAuth.authentication,adminController.blockUser)

router.get("/unblock_user/:id",nocache(),adminAuth.authentication,adminController.unBlockUser)

router.get("/products",nocache(),adminAuth.authentication,adminController.getAllProducts)

router.get("/add_products",nocache(),adminAuth.authentication,adminController.addProduct)
router.post("/add_products",adminAuth.authentication,adminController.addProductPost)

router.get("/delete_product/:id",nocache(),adminAuth.authentication,adminController.deleteProduct)

router.get("/edit_product/:id",nocache(),adminAuth.authentication,adminController.editProduct)
router.post("/edit_product/:id",adminAuth.authentication,adminController.editProductPost)

router.get("/delete_img/:id/:del",nocache(),adminAuth.authentication,adminController.deleteImage)

router.get("/category",nocache(),adminAuth.authentication,adminController.getAllCategory)

router.get("/add_category",nocache(),adminAuth.authentication,adminController.addCategory)
router.post("/add_category",adminController.addCategoryPost)

// router.get("/delete_category/:id",nocache(),adminAuth.authentication,adminController.deleteCategory)
router.get("/disable_category/:id",nocache(),adminAuth.authentication,adminController.disableCategory)

router.get("/enable_category/:id",nocache(),adminAuth.authentication,adminController.enableCategory)

router.get("/edit_category/:id",nocache(),adminAuth.authentication,adminController.editCategory)
router.post("/edit_category/:id",adminAuth.authentication,adminController.editCategoryPost)

router.get("/sales_report",nocache(),adminAuth.authentication,adminController.salesReport)

router.get("/orders",nocache(),adminAuth.authentication,adminController.orders)

router.get("/single-order/:id",nocache(),adminAuth.authentication,adminController.singleOrder)

router.get("/coupons",nocache(),adminAuth.authentication,adminController.coupons)

router.get("/add-coupon",nocache(),adminAuth.authentication,adminController.addCoupons)
router.post("/add-coupon",adminAuth.authentication,adminController.addCouponsPost)

router.get("/edit-coupon/:id",adminAuth.authentication,adminController.editCoupon)
router.post("/edit-coupon/:id",adminAuth.authentication,adminController.editCouponPost)

router.get("/disable-coupon/:id",adminAuth.authentication,adminController.disableCoupon)
router.get("/enable-coupon/:id",adminAuth.authentication,adminController.enableCoupon)

router.get("/delete-coupon/:id",adminAuth.authentication,adminController.deleteCoupon)

router.get("/logout",nocache(),adminAuth.authentication,adminController.logout)


//ajax request

router.get("/chartData",adminAuth.authentication,adminController.chartData)

router.post("/changeOrderStatus",adminAuth.authentication,adminController.changeOrderStatus)

router.post("/sales-report",adminAuth.authentication,adminController.salesReportPost)

module.exports = router;
