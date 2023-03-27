const authentication = function(req, res, next){
    if(req.session.loggedIn){
        next()
    }else{
        req.session.next = req.url
        res.redirect("/login")
    }
}

module.exports = {authentication}