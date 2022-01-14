const User = require('../models/user')
const cloudinary = require('cloudinary').v2
const cookieToken = require('../utils/cookieToken')
const sendResponse =  require('../utils/sendResponse')
const crypto = require('crypto')

exports.register = async (req, res) => {
    const { name, email, password, introduction } = req.body

    if (!(name && email && password && introduction)) {
        return res.status(400).json({
            success: false,
            message: "Name, Email, Password and Introduction are required"
        })
    }

    if (!req.files) {
        return res.status(400).json({
            success: false,
            message: "Photo is required!"
        })
    }

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: "User is already registered!"
            })
        }
        const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
            folder: 'users'
        })
        const user = await User.create({
            name,
            email,
            password,
            photo: {
                id: result.public_id,
                secure_url: result.secure_url
            },
            introduction
        })

        cookieToken(user, res)

    } catch (error) {
        res.status(400).send("User registration failed!")
    }


}

exports.login = async (req, res) => {
    const { email, password } = req.body

    if (!(email && password)) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        })
    }

    try {
        const user = await User.findOne({ email }).select("+password")
        if (user && await user.isValidPassword(password)) {
            cookieToken(user, res)
        }
        else {
            return res.status(401).json({
                success: false,
                message: "User not registered or password did not match!",
            })
        }

    } catch (error) {
        console.log(error);
        res.status(400).send("User login failed!")
    }


}

exports.logout = (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true

    })
    res.status(200).json({
        success: true,
        message: "Logout Success!"
    })
}

exports.forgotPassowrd = async (req, res) => {
    try {
        const {email} = req.body

        if(!email) return sendResponse(res, 400, false, "Email is required!")

        const user = await User.findOne({email})

        if(!user) return sendResponse(res, 401, false, "User is not registered!")
        
        const token = user.getForgotPasswordToken()

        await user.save({validateBeforeSave : false})

        const url = `${req.protocol}://${req.get('Host')}/api/v1/password/reset/${token}`

        return res.status(200).json({
            success: true,
            token,
            url
        })

    } catch (error) {
        sendResponse(res, 401, false, "Error occured! " + error.message)
    }
}

exports.resetPassword = async(req, res) => {
    const {password, confirmPassword} = req.body
    const token = req.params.token

    if(!password || !confirmPassword || !token) return sendResponse(res, 400, false, "Invalid Url or password and confirm password is not provided")
    
    if(password !== confirmPassword) return sendResponse(res, 400, false, 'Password and Confirm Password do not match')

    const encryToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry : {
            $gt : Date.now()
        }
    })

    if(!user)  return sendResponse(res, 401, false, "Token is invalid or expired")

    user.password = password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    await user.save()

    cookieToken(user, res)
}

