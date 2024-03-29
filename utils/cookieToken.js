module.exports = (user, res) => {
    const token = user.getJWTToken()
    const options = {
        expires : new Date( Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    user.password = undefined
    res.status(200).cookie('token', token, options).json({
        success: true,
        token,
        user
    })
}