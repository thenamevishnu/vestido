const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require("express-handlebars")
const db = require("./config/db")
const session = require("express-session")
const file_upload = require("express-fileupload")
require("./hbs")

const userRouter = require('./routes/index');
const adminRouter = require('./routes/admins');

const app = express();

app.use(file_upload())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine("hbs",hbs.engine({extname:"hbs",defaultLayout:"layout",layoutsDir:__dirname+"/views/layout/",partialsDir:__dirname+"/partials/"}))
app.use(session({secret:"secret_key",resave:false,saveUninitialized:true,cookie:{maxAge:1000*60*60*24}}))
app.use('/', userRouter);
app.use('/admins', adminRouter);

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    console.log(err);
    let route = (req.url).split("/")[1]
    if(route=="admins")
        admin = true
    else
        admin = false
    res.render('error',{title:err.status,err_code:err.status,nofooter:true,user_header:true,admin});
});

module.exports = app;
