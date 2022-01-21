const bcrypt = require('bcryptjs/dist/bcrypt');
const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: [30, 'Name must be less than 30 chars']
    },
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, 'Please enter a valid email address'],
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password length should be greater than 6'],
        select: false
    },
    photo: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    introduction: {
        type: String,
        required: true,

    },
    followers: {
        type: Number,
        default: 0
    },
    articles: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Blog',
    }],
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }

})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10)
});

userSchema.methods.isValidPassword = async function (userPass) {
    return await bcrypt.compare(userPass, this.password)
}


userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.SECRET_KEY,
        { expiresIn: process.env.JWTTOKEN_EXPIRY })
}

userSchema.methods.getForgotPasswordToken = function () {
    const forgotPassowrdToken = crypto.randomBytes(20).toString('hex')
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotPassowrdToken).digest('hex')
    
    this.forgotPasswordExpiry = Date.now() +  process.env.FORGOTPASS_EXPIRY * 60 * 1000

    return forgotPassowrdToken
}

module.exports = mongoose.model('User', userSchema)