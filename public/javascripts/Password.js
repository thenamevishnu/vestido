function sendOtp(){
    let email = document.frm.email.value
    const email_regx = /^([A-Za-z_])([A-Za-z0-9-_.])+@([a-zA_Z0-9-_]){3,16}\.([A-Za-z]){2,3}$/gm
    let err = document.getElementsByClassName("text-danger remove-err")

    if(email == ""){
        err[0].innerHTML = "Enter the email!"
        return false
    }
    if(!email_regx.test(email)){
        err[0].innerHTML = "Invalid email!"
        return false
    }
    err[0].innerHTML = "Sending an otp to "+email+"..."
    $.get("/emailExist",{
        email:email
    },
    function(response){
        if(response.error){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }else
        if(response=="notexist"){
            err[0].innerHTML = "Email is not registered with us!"
        }else if(response=="error"){
            err[0].innerHTML = "Error happend!"
        }else if(response=="sent"){
            document.getElementById("otp-input").style.display = "block"
            document.getElementById("sendotp").style.display = "none"
            document.getElementById("done").style.display = "block"
            err[0].innerHTML = "<i><font color='green'>OTP Sent to "+email+"</font></i>"
        }else{
            err[0].innerHTML = "Unknown Error!"
        }
    })
  return false
}

function validateOtp(){
    let err = document.getElementsByClassName("text-danger remove-err")
    let otp = document.frm.otp.value
    let email = document.frm.email.value
    if(otp == ""){
        err[1].innerHTML = "Enter the otp!"
        return false
    }
    $.post("/validateOtp",{
        email:email,
        otp:otp
    },
    function(response){
        if(response.error){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }else
        if(response==false){
            err[1].innerHTML = "Entered otp is incorrect!"
        }else{
            err[1].innerHTML = "<i><font color='green'>Redirecting...</font></i>"
            setTimeout(()=>{
                window.location = "/setPassword?key="+response
            },2000)
        }
    })

}

function setNewPassword(){
    let password = document.frm.password.value
    let confirm_password = document.frm.confirm_password.value
    const password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm
    const confirm_password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm

    let err = document.getElementsByClassName("text-danger remove-err")

    if(password=="" && confirm_password==""){
        err[0].innerHTML = "Enter new password!"
        err[1].innerHTML = "Enter confirm password!"
        return false
    }
    if(password==""){
        err[0].innerHTML = "Enter password!"
        return false
    }
    if(!password_regx.test(password)){
        err[0].innerHTML="Must Contain A-Z,a-z,0-9,special and 8-16 length"
        return false
    }

    $.get("/checkCurrentPassword",{
        password:password
    },
    function(response){
        if(response.error){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }else
        if(response=="exist"){
            err[0].innerHTML = "Entered password is same as your old password!"
        }else{
            if(confirm_password==""){
                err[1].innerHTML = "Enter Confirm password!"
                return false
            }
            if(!confirm_password_regx.test(confirm_password)){
                err[1].innerHTML="Must Contain A-Z,a-z,0-9,special and 8-16 length"
                return false
            }
            if(password!=confirm_password){
                err[1].innerHTML="Password does not match!"
                return false
            }
            $.post("/reset_password",{
                password:password
            },
            function(response){
                if(response.error){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                    })
                }else
                if(response=="done"){
                    err[1].innerHTML = "<i><font color='green'>Your passsword reset successfull!</font></i>"
                    setTimeout(()=>{
                        err[1].innerHTML = "<i><font color='green'>Redirecting...</font></i>"
                    },1200)
                    setTimeout(()=>{
                        window.location = "/login"
                    },2000)
                }
            })
        }
    })

    return false
}

function changePassword(){
    let current_password = document.frm.old_password.value
    let password = document.frm.password.value
    let confirm_password = document.frm.confirm_password.value
    const old_password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm
    const password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm
    const confirm_password_regx = /^(?=.*?[A-Za-z0-9_!@#$%^&*()_+:"|}{<>?,.])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[!@#$%^&*()_+<>?,.:"|;']).{8,16}$/gm

    let err = document.getElementsByClassName("text-danger remove-err")

    if(current_password=="" && password=="" && confirm_password==""){

        err[0].innerHTML = "Enter current password!"
        err[1].innerHTML = "Enter new password!"
        err[2].innerHTML = "Enter confirm password!"
        return false
    }
    if(current_password==""){
        err[0].innerHTML = "Enter current password!"
        return false
    }
    if(!old_password_regx.test(current_password)){
        err[0].innerHTML="Must Contain A-Z,a-z,0-9,special and 8-16 length"
        return false
    }

    $.get("/change_user_password",{
        password:current_password
    },
    function(response){
        if(response.error){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }else
        if(response.status=="invalid"){
            err[0].innerHTML = "Password is incorrect!"
        }else{
            if(password==""){
                err[1].innerHTML = "Enter new password!"
                return false
            }
            if(!password_regx.test(password)){
                err[1].innerHTML="Must Contain A-Z,a-z,0-9,special and 8-16 length"
                return false
            }
            $.get("/change_user_password",{
                new_password:password
            },function(response){
                if(response.error){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                    })
                }else
                if(response.status=="current"){
                    err[1].innerHTML = "Password is same as your current password!"
                }else{
                    if(confirm_password==""){
                        err[2].innerHTML = "Enter Confirm password!"
                        return false
                    }
                    if(!confirm_password_regx.test(confirm_password)){
                        err[2].innerHTML="Must Contain A-Z,a-z,0-9,special and 8-16 length"
                        return false
                    }
                    if(password!=confirm_password){
                        err[2].innerHTML="Password does not match!"
                        return false
                    }
                    $.post("/change_user_password",{
                        changed_password:password
                    },
                    function(response){
                        if(response.error){
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Something went wrong!',
                            })
                        }else
                        if(response=="done"){
                            err[2].innerHTML = "<i><font color='green'>Your passsword changed successfully!</font></i>"
                            setTimeout(()=>{
                                err[2].innerHTML = "<i><font color='green'>Redirecting...</font></i>"
                            },1200)
                            setTimeout(()=>{
                                window.location = "/profile"
                            },2000)
                        }
                    })
                }
            })
        }
    })

    return false
}