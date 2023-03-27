const authentication = function(req, res, next){
    if(req.session.adminLogged)
        next()
    else
        res.redirect("/admins/login")
}

module.exports = {authentication}