const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: [150, 'description must be less than 150 chars']
    },
    likes: [
        String
    ],
    numberOfLikes: {
        type: Number,
        default: 0
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String, required: true
            },
            comment: {
                type: String,
                maxlength: [100, 'Comment must be less than 100 chars'],
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    content: {
        type:String,
        required: true
    },
    keywords : [String],
    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Blog', blogSchema)