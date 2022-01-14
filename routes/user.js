const express = require('express')
const { register , login, logout , forgotPassowrd, resetPassword} = require('../controllers/userController')
const { isLoggedIn } = require('../middleware/user')

const router = express.Router()

router.route('/').get()
router.route('/signup').post(register)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotpassword').post(forgotPassowrd)
router.route('/password/reset/:token').post(resetPassword)

module.exports = router