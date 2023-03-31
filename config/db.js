const mongoose = require("mongoose")
require("dotenv").config()
const username = process.env.mongodb_username
const password = process.env.mongodb_password
let uri = "mongodb+srv://"+username+":"+password+"@vestido.kg7ulv9.mongodb.net/shopping?retryWrites=true&w=majority"
mongoose.set("strictQuery", false)
mongoose.connect(uri).then(connect => {
    console.log("Server Connection Successfull!");
})