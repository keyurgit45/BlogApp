const jwt = require('jsonwebtoken')
const User = require('../models/user')
const BigPromise = require('../utils/bigPromise')

exports.isLoggedIn = BigPromise( async (req, res, next) => {
   
    if(!req.header('Authorization') && !req.cookies) next(new Error("Token not found . Login first to access this Page."))

    const token = req.cookies.token || req.header('Authorization').replace("Bearer ", "")

    if (!token) return next(new Error("Login first to access this Page."))

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded) {
        req.user = await User.findById(decoded.id)
    }
    
    next()

})