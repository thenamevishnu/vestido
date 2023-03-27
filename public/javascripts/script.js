window.onload = function(){
    const today = new Date().toISOString().split("T")[0]
    if(document.getElementById("start")){
        document.getElementById("start").setAttribute("min",today)
        document.getElementById("expire").setAttribute("min",today)
    }
    
}

docTitle = document.title
window.addEventListener("blur",()=>{
    document.title = "Come Back 😢"
})
window.addEventListener("focus",()=>{
    document.title = docTitle
})

function openNav() {
    document.getElementById("sidenav").style.width = "250px";
}
function closeNav() {
    document.getElementById("sidenav").style.width = "0";
}
function adminOpenNav() {
    document.getElementById("mySidenavAdmin").style.width = "250px";
}
function adminCloseNav() {
    document.getElementById("mySidenavAdmin").style.width = "0";
}

function formChanged(){
    const all = document.getElementsByClassName("text-danger remove-err")
    let i=0
    while(i<all.length){
            all[i].innerHTML = ""
            i++
    }
}

function loginValidate(){
    const email = document.frm.email.value
    const password = document.frm.password.value
    let all = document.getElementsByClassName("text-danger remove-err");
    const email_regx = /^([A-Za-z_])([A-Za-z0-9-_.])+@([a-zA_Z0-9-_]){3,16}\.([A-Za-z]){2,3}$/gm
    const password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm
    if(email=="" && password==""){
        all[0].innerHTML = "Email is required!"
        all[1].innerHTML = "Password is required!"
        return false
    }
    if(email==""){
        all[0].innerHTML = "Email is required!"
        return false
    }
    if(!email_regx.test(email)){
        all[0].innerHTML = "Invalid Email Format!"
        return false
    }
    if(password==""){
        all[1].innerHTML = "Password is required!"
        return false
    }
    if(!password_regx.test(password)){
        all[1].innerHTML = "Must Contain A-Z,a-z,0-9,special and 8-16 length!"
        return false
    }
    return true
}

function signupValidate(){
    const first_name = document.frm.first_name.value
    const last_name = document.frm.last_name.value
    const username = document.frm.username.value
    const email = document.frm.email.value
    const phone = document.frm.phone.value
    const password = document.frm.password.value
    const confirm_password = document.frm.confirm_password.value
    const otp = document.frm.otp.value

    const fname_regx = /^[A-Za-z\s+]{5,16}$/gm
    const lname_regx = /^[A-Za-z\s+]{1,16}$/gm
    const username_regx = /^[A-Za-z0-9_]{5,16}$/gm
    const email_regx = /^([A-Za-z_])([A-Za-z0-9-_.])+@([a-zA_Z0-9-_]){3,16}\.([A-Za-z]){2,3}$/gm
    const password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm
    const confirm_password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm

    let all = document.getElementsByClassName("text-danger remove-err")

    if(first_name=="" && last_name=="" && username=="" && email=="" && phone=="" && password=="" && confirm_password==""){
        let i = 0
        while(i<all.length){
            all[i].innerHTML = "This field is required!"
            i++
        }
        return false
    }else
    if(first_name==""){
        all[0].innerHTML="First Name Required!"
        return false
    }else
    if(!fname_regx.test(first_name)){
        all[0].innerHTML="Only allowed A-Z,a-z & 5-16 characters"
        return false
    }else
    if(last_name==""){
        all[1].innerHTML="Last Name Required!"
        return false
    }else
    if(!lname_regx.test(last_name)){
        all[1].innerHTML="Only allowed A-Z,a-z & 1-16 characters"
        return false
    }else
    if(username==""){
        all[2].innerHTML="UserName Required!"
        return false
    }else
    if(!username_regx.test(username)){
        all[2].innerHTML="Only allowed A-Z,a-z,0-9,_ & 5-16 characters"
        return false
    }else
    if(email==""){
        all[3].innerHTML="Email Required!"
        return false
    }else
    if(!email_regx.test(email)){
        all[3].innerHTML="Invalid Email Format!"
        return false
    }else
    if(phone==""){
        all[4].innerHTML="Phone Number Is Empty!"
        return false
    }else
    if(phone.toString().length != 10){
        all[4].innerHTML="Phone Number Must be 10 digits!"
        return false
    }else
    if(password==""){
        all[5].innerHTML="Password Required!"
        return false
    }else
    if(!password_regx.test(password)){
        all[5].innerHTML="Must Contain A-Z,a-z,0-9,special and 8-16 length"
        return false
    }else
    if(confirm_password==""){
        all[6].innerHTML="Confirm Password Required!"
        return false
    }else
    if(!confirm_password_regx.test(confirm_password)){
        all[6].innerHTML="Must Contain A-Z,a-z,0-9,special and 8-16 length"
        return false
    }else
    if(password!=confirm_password){
        all[6].innerHTML="Password does not match!"
        return false
    }else
    if(otp==""){
        $.post("/verifySignup",{
            email: email,
            username:username,
            phone:phone
        },function(response){
            if(response.status){
                all[6].innerHTML=null
                document.getElementById("otp-box").style.display="block"
                all[7].innerHTML="<font color='green'>Enter OTP we have sent to "+email+"<font>"
                return false
            }else{
                if(response.err=="username"){
                    all[2].innerHTML="Username already exist!"
                    return false
                }
                if(response.err=="email"){
                    all[3].innerHTML="Email already exist!"
                    return false
                }
                if(response.err=="phone"){
                    all[4].innerHTML="Number already exist!"
                    return false
                }
            }
        })
        return false
    }else{
        $.post("/signupOtpCheck",{
            otp : otp,
            first_name:first_name,
            last_name:last_name,
            username:username,
            email:email,
            phone:phone,
            password:password
        },function(response){
            if(response.status){
                all[7].innerHTML="<font color='green'>Email Verified!</font>"
                setTimeout(()=>{
                    location.reload()
                },1500)
                return false
            }else{
                all[7].innerHTML="Invalid OTP!"
                return false
            }
        })
        return false
    }
}

function adminLogin(){
    const email = document.frm.email.value
    const password = document.frm.password.value
    let all = document.getElementsByClassName("text-danger remove-err");
    const email_regx = /^([A-Za-z_])([A-Za-z0-9-_.])+@([a-zA_Z0-9-_]){3,16}\.([A-Za-z]){2,3}$/gm
    const password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm
    if(email=="" && password==""){
        all[0].innerHTML = "Email is required!"
        all[1].innerHTML = "Password is required!"
        return false
    }
    if(email==""){
        all[0].innerHTML = "Email is required!"
        return false
    }
    if(!email_regx.test(email)){
        all[0].innerHTML = "Invalid Email Format!"
        return false
    }
    if(password==""){
        all[1].innerHTML = "Password is required!"
        return false
    }
    if(!password_regx.test(password)){
        all[1].innerHTML = "Must Contain A-Z,a-z,0-9,special and 8-16 length!"
        return false
    }
    return true
}

function addProductValidation(){
    const title = document.frm.title.value
    const price = document.frm.price.value
    const brand = document.frm.brand.value
    const category = document.frm.category.value
    const sub_category = document.frm.sub_category.value
    const stocks = document.frm.stocks.value
    const description = document.frm.description.value
    const size_sm = document.frm.size_sm.checked
    const size_md = document.frm.size_md.checked
    const size_lg = document.frm.size_lg.checked
    const size_xl = document.frm.size_xl.checked
    const size_xxl = document.frm.size_xxl.checked
    const files = document.frm.file.value

    const regx_title = /^\w+([\w\W]){5,80}$/gm
    const regx_brand = /^\w[\w\s]{5,}$/gm
    const regx_desc = /^\w+([\w\W]){5,180}$/gm
    
    let all = document.getElementsByClassName("text-danger remove-err");
    

    if(title=="" && price=="" && brand=="" && category=="0" && sub_category=="" && stocks=="" && description=="" && files=="" && !size_sm && !size_md && !size_lg && !size_xl && !size_xxl){
        i=0
        while(i<all.length){
            all[i].innerHTML = "This fields required!"
            i++
        }
        return false
    }
    if(!regx_title.test(title)){
        all[0].innerHTML="Minimum 5 characters & words are allowed!"
        return false
    }
    if(price==""){
        all[1].innerHTML="Price is empty!"
        return false
    }
    if(isNaN(price)){
        all[1].innerHTML="Enter price in numberic!"
        return false
    }
    if(!regx_brand.test(brand)){
        all[2].innerHTML="Minimum 5 characters & words are allowed!"
        return false
    }
    if(category=="0"){
        all[3].innerHTML="Category is invalid!"
        return false
    }
    if(sub_category=="0"){
        all[4].innerHTML="Sub category is invalid!"
        return false
    }
    if(stocks==""){
        all[5].innerHTML="Stock is empty!"
        return false
    }
    if(isNaN(stocks)){
        all[5].innerHTML="Enter stocks in numberic!"
        return false
    }
    if(!regx_desc.test(description)){
        all[6].innerHTML="Minimum 10 characters & words are allowed!"
        return false
    }
    if(!size_sm && !size_md && !size_lg && !size_xl && !size_xxl){
        all[7].innerHTML="Select at least 1 size!"
        return false
    }
    if(files==""){
        all[8].innerHTML="Select at least 2 images"
        return false
    }
    return true
}

function editProductValidation(){
    const title = document.frm.title.value
    const price = document.frm.price.value
    const brand = document.frm.brand.value
    const category = document.frm.category.value
    const sub_category = document.frm.sub_category.value
    const stocks = document.frm.stocks.value
    const description = document.frm.description.value
    const size_sm = document.frm.size_sm.checked
    const size_md = document.frm.size_md.checked
    const size_lg = document.frm.size_lg.checked
    const size_xl = document.frm.size_xl.checked
    const size_xxl = document.frm.size_xxl.checked

    const regx_title = /^\w+([\w\W]){5,80}$/gm
    const regx_brand = /^\w[\w\s]{5,}$/gm
    const regx_desc = /^\w+([\w\W]){5,180}$/gm

    let all = document.getElementsByClassName("text-danger remove-err");
    

    if(title=="" && price=="" && brand=="" && category=="" && sub_category=="" && stocks=="" && description=="" && !size_sm && !size_md && !size_lg && !size_xl && !size_xxl){
        i=0
        while(i<all.length-2){
            all[i].innerHTML = "This fields required!"
            i++
        }
        return false
    }
    if(title==""){
        all[0].innerHTML="Title Required!"
        return false
    }
    if(!regx_title.test(title)){
        all[0].innerHTML="Minimum 5 characters & words are allowed!"
        return false
    }
    if(price==""){
        all[1].innerHTML="Price is empty!"
        return false
    }
    if(isNaN(price)){
        all[1].innerHTML="Enter price in numberic!"
        return false
    }
    if(!regx_brand.test(brand)){
        all[2].innerHTML="Minimum 5 characters & words are allowed!"
        return false
    }
    if(category=="0"){
        all[3].innerHTML="Category is invalid!"
        return false
    }
    if(sub_category=="0"){
        all[4].innerHTML="Sub category is invalid!"
        return false
    }
    if(stocks==""){
        all[5].innerHTML="Stock is empty!"
        return false
    }
    if(isNaN(stocks)){
        all[5].innerHTML="Enter stocks in numberic!"
        return false
    }
    if(!regx_desc.test(description)){
        all[6].innerHTML="Minimum 10 characters & words are allowed!"
        return false
    }
    if(!size_sm && !size_md && !size_lg && !size_xl && !size_xxl){
        all[7].innerHTML="Select at least 1 size!"
        return false
    }
    return true
}

function categoryValidation(){
    const category = document.frm.category.value
    const sub_category = document.frm.sub_category.value
    let all = document.getElementsByClassName("text-danger remove-err");
    
    const category_regx = /^\w[\w,-]{2,}$/gm
    const sub_category_regx = /^\w[\w,-]{2,}$/gm

    if(category=="" && sub_category==""){
        all[0].innerHTML = "Category is required!"
        all[1].innerHTML = "Sub Category is required!"
        return false
    }
    if(category==""){
        all[0].innerHTML = "Category is required!"
        return false
    }
    if(!category_regx.test(category)){
        all[0].innerHTML = "Only word and commas are allowed!"
        return false
    }
    if(sub_category==""){
        all[1].innerHTML = "Sub category is required!"
        return false
    }
    if(!sub_category_regx.test(sub_category)){
        all[1].innerHTML = "Only word and commas are allowed!"
        return false
    }
    return true    
}

function changeImage(image){
    document.getElementById("product-image").src = image;
}

function selectSize(data,id){
    document.getElementById("addtocart").href = `/addtocart/${id}/${data}`
    document.getElementById("wish-now").href = `/addtowishlist/${id}/${data}`
    document.getElementById("show_selected").innerHTML = data
}

function counterPlus(product_id,size,price,index){
    const value = parseInt(document.getElementById(""+product_id+""+size+"qty").value)
    if(value > 0){
        document.getElementById(""+product_id+""+size+"M").style.visibility = "visible";
    }
    if(value == 10){
        document.getElementById(""+product_id+""+size+"P").style.visibility = "hidden";
        return;
    }
    $.post("/add_qty",{
        index:index,
        product_id:product_id,
        size:size,
        qty:value+1
    },function(response){
        if(response.status){
            document.getElementById(""+product_id+""+size+"showcount").innerHTML = value + 1
            document.getElementById(""+product_id+""+size+"qty").value = value + 1
            document.getElementById(""+product_id+""+size+""+price+"total").innerHTML = ((value + 1)*price).toFixed(2)
            all = document.getElementsByClassName("get-all-prices");
            i=0 , total = 0
            while(i<all.length){
                total += parseFloat(all[i].innerHTML)
                i++
            }
            document.getElementById("grandTotal1").innerHTML = total.toFixed(2)
            document.getElementById("grandTotal2").innerHTML = total.toFixed(2)
        }else{
            Swal.fire({icon: 'error',title:"Quantity Alert!", text:"No Enough quantity!", confirmButtonText: "OK",confirmButtonColor:"#ff0000"
            })
        }
        return
    })
    return
}

function counterMinus(product_id,size,price,index){
    const value = parseInt(document.getElementById(""+product_id+""+size+"qty").value)
    if(value == 1){
        document.getElementById(""+product_id+""+size+"M").style.visibility = "hidden";
        return
    }
    if(value == 10){
        document.getElementById(""+product_id+""+size+"P").style.visibility = "visible";
    }
    $.post("/add_qty",{
        index:index,
        product_id:product_id,
        size:size,
        qty:value-1
    },function(response){
        if(response.status){
            document.getElementById(""+product_id+""+size+"qty").value = value-1;
            document.getElementById(""+product_id+""+size+"showcount").innerHTML = value-1
            document.getElementById(""+product_id+""+size+""+price+"total").innerHTML = ((value - 1)*price).toFixed(2)
            all = document.getElementsByClassName("get-all-prices");
            i=0 , total = 0
            while(i<all.length){
                total += parseFloat(all[i].innerHTML)
                i++
            }
            document.getElementById("grandTotal1").innerHTML = total.toFixed(2)
            document.getElementById("grandTotal2").innerHTML = total.toFixed(2)
            return
        }
        return
    })
    return
}

function purchaseCod(product_id,size){
    $.post("/success",{
        product_id:product_id,
        size:size
    })
}

function checkoutForm(){
    const country = document.frm.country.value
    const first_name = document.frm.first_name.value
    const last_name = document.frm.last_name.value
    const address = document.frm.address.value
    const state = document.frm.state.value
    const zip = document.frm.zip.value
    const email = document.frm.email.value
    const phone = document.frm.phone.value
    const notes = document.frm.notes.value
    const payment = document.frm.payment.value
    const saveAddress = document.frm.saveAddress.checked

    const fname_regx = /^[A-Za-z\s+]{5,16}$/gm
    const lname_regx = /^[A-Za-z\s+]{1,16}$/gm
    const email_regx = /^([A-Za-z_])([A-Za-z0-9-_.])+@([a-zA_Z0-9-_]){3,16}\.([A-Za-z]){2,3}$/gm
    const address_regx = /^\w([\w()\s+&-_\\\/]){10,255}$/gm
    const phone_regx = /^[0-9]{10,10}$/gm
    const notes_regx = /^[A-z]([A-z\s+0-9-_&":]){10,255}$/gm
    const zip_regx = /^[0-9]{6,6}$/gm

    const all = document.getElementsByClassName("text-danger remove-err");

    if(country=="0" && first_name=="" && last_name=="" && state=="0" && zip=="" && email=="" && phone=="" && notes=="" && payment == "0" && address==""){
        i=0
        while(i<all.length){
            if(i!=10){
                all[i].innerHTML = "This fields are required!"
            }
            i++
        }
        return false
    }else if(country=="0"){
        all[0].innerHTML = "Select you country!"
        return false
    }else if(first_name==""){
        all[1].innerHTML = "Enter your first name!"
        return false
    }else if(!fname_regx.test(first_name)){
        all[1].innerHTML = "Only allowed A-Z,a-z,5-16 characters and space"
        return false
    }else if(last_name==""){
        all[2].innerHTML = "Enter your last name!"
        return false
    }else if(!lname_regx.test(last_name)){
        all[2].innerHTML = "Only allowed A-Z,a-z,1-16 characters and space"
        return false
    }else if(address==""){
        all[3].innerHTML = "Enter your address!"
        return false
    }else if(!address_regx.test(address)){
        all[3].innerHTML = "Only allowed A-Z,a-z,0-9,()&-_\/, 10-255characters and space"
        return false
    }else if(state=="0"){
        all[4].innerHTML = "Select the state!"
        return false
    }else if(zip==""){
        all[5].innerHTML = "Enter your zip/posta code!"
        return false
    }else if(!zip_regx.test(zip)){
        all[5].innerHTML = "Only 6 digits are allowed!"
        return false
    }else if(email==""){
        all[6].innerHTML = "Enter your email!"
        return false
    }else if(!email_regx.test(email)){
        all[6].innerHTML = "Invalid email!"
        return false
    }else if(phone==""){
        all[7].innerHTML = "Enter your contact number!"
        return false
    }else if(!phone_regx.test(phone)){
        all[7].innerHTML = "Only 10 digits are allowed!"
        return false
    }else if(notes==""){
        all[8].innerHTML = "Enter the notes!"
        return false
    }else if(!notes_regx.test(notes)){
        all[8].innerHTML = 'Only A-z,0-9,-_&": , space and 10-255 charecters are allowed!'
        return false
    }else if(payment=="0"){
        all[9].innerHTML = "Select the payment method!"
        return false
    }else{
        $("#checkoutForm").submit((e)=>{
            e.preventDefault()
            $.ajax({
                url : "/success",
                method : "post",
                data : $("#checkoutForm").serialize(),
                success : (response)=>{
                    if(response?.cod){
                        location.href = "/success"
                    }else{
                        razorpayPayment(response)
                    }
                }
            })
        })
    }
    return true
}

function razorpayPayment(order){
    let options = {
        "key": "rzp_test_5IRlDvDszlG8yf", 
        "amount": order.amount,
        "currency": order.currency,
        "name": "VESTIDO",
        "description": "Online Payment",
        "image": "https://telegra.ph/file/7e4b7d2e62f66f5cf0725.jpg",
        "order_id": order.id,
        "handler": function (response){
            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9000090000"
        },
        "notes": {
            "address": "VESTIDO FASION SHOP"
        },
        "theme": {
            "color": "#8f8f8f"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment,order){
    $.post("/verify-payment",{
            payment,
            order
        },function(response){
            if(response.online){
                window.location = "/success"
            }else{
                window.location = "/checkout"
            }
        })
}

function changeProfileButton(){
    document.getElementById("profile-edit").style.display = "none"
    document.getElementById("profile-save").style.display = "block"
    let inputs = document.getElementsByClassName("profile-disabled-input")
    let i = 0
    while(i < inputs.length){
        if(i!=2 && i!=3 && i!=4){
            inputs[i].disabled = false
        }
        i++
    }
}

function ProfileValidate(){
    let first_name = document.frm.first_name.value
    let last_name = document.frm.last_name.value
    let gender = document.frm.gender.value
    const fname_regx = /^[A-Za-z\s+]{5,16}$/gm
    const lname_regx = /^[A-Za-z\s+]{1,16}$/gm

    console.log(first_name,last_name);

    let show = document.getElementsByClassName("text-danger")

    if(first_name=="" && last_name==""){
        show[0].innerHTML = "First name required!"
        show[1].innerHTML = "Last Name Required!"
        return false
    }
    if(first_name==""){
        show[0].innerHTML = "Enter First Name"
        return false
    }
    if(!fname_regx.test(first_name)){
        show[0].innerHTML = "Only allowed A-Z,a-z,5-16 characters and space"
        return false
    }
    if(last_name==""){
        show[1].innerHTML = "Enter Last Name"
        return false
    }
    if(!lname_regx.test(last_name)){
        show[1].innerHTML = "Only allowed A-Z,a-z,1-16 characters and space"
        return false
    }
    return true
}

function profileForm(){
    let err = document.getElementsByClassName("text-danger")
    let i = 0
    while(i < err.length){
        err[i].innerHTML = ""
        i++
    }
}

function changeOrderStataus(status,user_id,order_id){
    $.post("/admins/changeOrderStatus",{
        user_id:user_id,
        order_id:order_id,
        status:status
    },function(response){
        if(response.status){
            location.reload()
        }else{
            location.reload()
        }
    })
}

function couponValidation(){
    let code = document.frm.code.value
    let discount = document.frm.discount.value
    let stocks = document.frm.stocks.value
    let from = document.frm.start.value
    let to = document.frm.expire.value
    let min_amount = document.frm.min_amount.value
    let max_discount = document.frm.min_amount.value

    const code_regex = /^([A-Za-z0-9]){5,30}$/gm

    let err = document.getElementsByClassName("text-danger remove-err")

    if(code=="" && discount=="" && stocks=="" && from=="" && to=="" && min_amount=="" && max_discount==""){
        i=0
        while(i<err.length){
            err[i].innerHTML = "This field is required!"
            i++
        }
        return false
    }else
    if(!code){
        err[0].innerHTML = "Enter coupon code"
        return false
    }else
    if(!code_regex.test(code)){
        err[0].innerHTML = "Only allowed A-Z,a-z,0-9 and 5-30 characters"
        return false
    }else
    if(discount==""){
        err[1].innerHTML = "Enter discount in percentage"
        return false
    }else
    if(isNaN(discount)){
        err[1].innerHTML = "Enter discount in numeric"
        return false
    }else
    if(discount<0.1 || discount>100){
        err[1].innerHTML = "Minimum 0.1% and maximum 100%"
        return false
    }else
    if(min_amount==""){
        err[2].innerHTML = "Enter minimum purchase amount"
        return false
    }else
    if(isNaN(min_amount)){
        err[2].innerHTML = "Enter a numeric value"
        return false
    }else
    if(max_discount==""){
        err[3].innerHTML = "Enter minimum purchase amount"
        return false
    }else
    if(isNaN(max_discount)){
        err[3].innerHTML = "Enter a numeric value"
        return false
    }else
    if(stocks==""){
        err[4].innerHTML = "Enter number of coupons available"
        return false
    }else
    if(isNaN(stocks)){
        err[4].innerHTML = "Enter stocks in numeric"
        return false
    }else
    if(from==""){
        err[5].innerHTML = "Select start date"
        return false
    }else
    if(to==""){
        err[6].innerHTML = "Select expire date"
        return false
    }
    else{
        return true
    }
}

function applyCoupon(){
    const country = document.getElementById("country").value
    const first_name = document.getElementById("first_name").value
    const last_name = document.getElementById("last_name").value
    const address = document.getElementById("address").value
    const state = document.getElementById("state").value
    const zip = document.getElementById("zip").value
    const email = document.getElementById("email").value
    const phone = document.getElementById("phone").value
    const notes = document.getElementById("notes").value
    const payment = document.getElementById("payment").value

    const fname_regx = /^[A-Za-z\s+]{5,16}$/gm
    const lname_regx = /^[A-Za-z\s+]{1,16}$/gm
    const email_regx = /^([A-Za-z_])([A-Za-z0-9-_.])+@([a-zA_Z0-9-_]){3,16}\.([A-Za-z]){2,3}$/gm
    const address_regx = /^\w([\w()\s+&-_\\\/]){10,255}$/gm
    const phone_regx = /^[0-9]{10,10}$/gm
    const notes_regx = /^[A-z]([A-z\s+0-9-_&":]){10,255}$/gm
    const zip_regx = /^[0-9]{6,6}$/gm

    const fill = document.getElementById("fill-address");

    if(country=="0" || !fname_regx.test(first_name) || !lname_regx.test(last_name) || state=="0" || !zip_regx.test(zip) || !email_regx.test(email) || !phone_regx.test(phone) || !notes_regx.test(notes) || payment == "0" || !address_regx.test(address)){
        fill.innerHTML = "Fill Form Before Apply Coupon!"
        document.getElementById("input-coupon").value = ""
        setTimeout(()=>{
            fill.innerHTML = ""
        },2000)
        return false
    }
    fill.innerHTML = ""
    let code = document.getElementById("input-coupon").value
    if(!code){
        document.getElementById("coupon-err").innerHTML = "<font color='red'>Enter valid coupon!</font>"
        return;
    }
    console.log(code);
    $.post("/checkCoupon",{
        code : code
    },function(response){
        if(response.status=="not found"){
            document.getElementById("coupon-err").innerHTML = "<font color='red'>Invalid Coupon!</font>"
        }else if(response.status=="expired"){
            document.getElementById("coupon-err").innerHTML = "<font color='red'>Coupon Expired!</font>"
        }else{
            document.getElementById("coupon-err").innerHTML = "<font color='success'>Coupon Applied!</font>"
            setTimeout(()=>{
                document.getElementById("coupon-err").innerHTML = ""
            },2000)
            document.getElementById("disPrice").innerHTML = "-₹"+response.disPrice
            document.getElementById("grandTotal").innerHTML = "₹"+response.totalPrice
            document.getElementById("disPriceShow").style.display = "flex"
        }
    })
}

function rating(rating,product_id){
    rate = document.getElementsByClassName("review-star")
    i=0
    while(i<5){
        rate[i].innerHTML = "<i class='far fa-star fs-3'></i>"
        i++
    }
    i=0
    while(i<rating){
        document.getElementById("review-valid").value = 1
        rate[i].innerHTML = "<i class='fa fa-star fs-3 text-success'></i>"
        i++
    }
    $.post("/postRating",{
        rating: rating,
        product_id: product_id
    })
}

function reviewForm(product_id){
    let text = document.frm.review.value
    let id = document.getElementsByClassName("text-danger remove-err")
    const regex = /^([\w])([\w\W]){5,80}$/gm
    
    if(document.getElementById("review-valid").value==0){
        id[0].innerHTML = "Rate at least 1 star!"
        return false
    }else
    if(text==""){
        id[0].innerHTML = "Enter Review!"
        return false
    }else if(!regex.test(text)){
        id[0].innerHTML = "Only allowed 5-80 characters!"
        return false
    }else{
        $.post("/postReview",{
            message: text,
            product_id: product_id
        },function(response){
            if(response.status){
                Swal.fire("Review", "Review Updated", "success", {
                    confirmButtonText: "OK"
                }).then(data=>{
                    location.href = "/product_details/"+response.product_id
                })
                return false
            }
        })
        return false
    }
    
}


function contactValidation(){
    let name = document.frm.name.value
    let email = document.frm.email.value
    let subject = document.frm.subject.value
    let message = document.frm.message.value

    const name_regx = /^[A-Za-z\s+]{5,16}$/gm
    const email_regx = /^([A-Za-z_])([A-Za-z0-9-_.])+@([a-zA_Z0-9-_]){3,16}\.([A-Za-z]){2,3}$/gm
    const subject_regx = /^([\w])([\w\W]){5,80}$/gm
    const message_regx = /^([\w])([\w\W]){10,500}$/gm

    let err = document.getElementsByClassName("text-danger remove-err")

    if(name=="" && email=="" && subject=="" && message==""){
        i=0
        while(i<err.length){
            err[i].innerHTML = "This field required!"
            i++
        }
        return false
    }else
    if(name==""){
        err[0].innerHTML = "Name required!"
        return false
    }else
    if(!name_regx.test(name)){
        err[0].innerHTML = "Only allowed A-z,a-z and space!"
        return false
    }else
    if(email==""){
        err[1].innerHTML = "Email required!"
        return false
    }else
    if(!email_regx.test(email)){
        err[1].innerHTML = "Invalid email!"
        return false
    }else
    if(subject==""){
        err[2].innerHTML = "Subject required!"
        return false
    }else
    if(!subject_regx.test(subject)){
        err[2].innerHTML = "Only 5-80 characters are allowed!"
        return false
    }else
    if(message==""){
        err[3].innerHTML = "Subject required!"
        return false
    }else
    if(!message_regx.test(message)){
        err[3].innerHTML = "Only 10-500 characters are allowed!"
        return false
    }else{
        err[3].innerHTML = "<font color='success'>Sending...</font>"
        setTimeout(()=>{
            err[3].innerHTML = ""
        },2000)
        $.post("/contact",{
            name: name,
            email: email,
            subject: subject,
            message: message
        },function(response){
            if(response.status){
                Swal.fire("GET IN TOUCH", "We will respond as soon as possible!", "success", {
                    confirmButtonText: "OK"
                }).then(result=>{
                    if(result.isConfirmed){
                        location.href = "/shop"
                    }
                })
                return false
            }
        })
        return false
    }
    return false
}

function sales_report(value){
    $.post("/admins/sales-report",{
        filter:value
    },function(response){
        if(response.status){
            location.reload()
        }
    })
}

function ExportToExcel(type, fn, dl) {
    var elt = document.getElementById("sales-report");
    var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
        XLSX.writeFile(wb, fn || ('MySheetName.' + (type || 'xlsx')));
}

function returnOrder(order_id){
    $.post("/returnOrder",{
        id:order_id
    },function(response){
        if(response.status){
            document.getElementById("returnOrder1").style.display = "none"
            document.getElementById("returnOrder").style.display = ""
            document.getElementById("order_id").value = order_id
        }else{
            location.reload()
        }
    })
}

function returnForm(){
    let text = document.frm.reason.value
    let err = document.getElementsByClassName("text-danger remove-err")
    if(text==""){
        err[0].innerHTML = "Enter reason for return!"
        return false;
    }else
    if(text.length<10){
        err[0].innerHTML = "Message is too small!"
        return false;
    }else{
        return true
    }
}
