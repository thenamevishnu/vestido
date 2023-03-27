const nodemailer = require("nodemailer");
require("dotenv").config()

module.exports = {
    sendOtp:(to,otp)=>{
        return new Promise(async (resolve,reject)=>{
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.email,
                    pass: process.env.mail_password
                }
            })
    
            const mailOptions = {
                from: "mail.vestidofashion@gmail.com",
                to: `${to}`,
                subject: "VERIFICATION",
                html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                  <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">VESTIDO FASHION SHOP</a>
                  </div>
                  <p style="font-size:1.1em">Hi,</p>
                  <p>Thank you for choosing VESTIDO. Use the following OTP to complete your procedures. This otp is valid for only 5 minutes.</p>
                  <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                  <p style="font-size:0.9em;">Regards,<br />VESTIDO</p>
                  <hr style="border:none;border-top:1px solid #eee" />
                  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>VESTIDO Inc</p>
                    <p>Calicut, Kerala</p>
                    <p>India</p>
                  </div>
                </div>
              </div>`
            }
    
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                resolve("failed")
            } else {
                resolve("sent")
            }
            })
        })
    },

    sendMessage:(data)=>{
      return new Promise(async (resolve,reject)=>{
          let {name,email,subject,message} = data
          const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                  user: process.env.email,
                  pass: process.env.mail_password
              }
          })
  
          const mailOptions = {
              from: process.env.email,
              to: process.env.email,
              subject: `${subject}`,
              html: `<b>Name : </b><code>${name}</code><br><br><b>Email : </b><code>${email}</code><br><br><b>Message : </b><code>${message}`
          }
  
          transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              resolve("failed")
          } else {
              resolve("sent")
          }
          })
      })
  }
}