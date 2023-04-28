const blog = require('../models/blog')
const Blog = require('../models/blog')
const BigPromise = require('../utils/bigPromise')
const sendResponse = require('../utils/sendResponse')

exports.createBlog = BigPromise(async (req, res, next) => {
    const {
        title, 
        description,
        content,
        keywords
    } = req.body

    if(!title || !description || !content || !keywords){
        return sendResponse(res, 400, false, "title, description, content, keywords are required!")
    }

    const author = req.user.name
    const user = req.user._id

    const blog = await Blog.create({title,description,content,keywords,author,user})

    return res.status(200).json({
        success: true,
        blog
    })
    
})

exports.myBlogs = BigPromise(async (req, res, next) => {

    const blogs = await Blog.find({user: req.user._id})

    if(!blogs) return sendResponse(res, 400 , false, "NO blogs uploaded yet!")

    blogs.likes = undefined    
    return res.status(200).json({
        success: true,
        count: blogs.length,
        blogs
    })
    
})

exports.deleteBlog = BigPromise(async (req, res, next) => {

    const blogId = req.params.blogId

    const blog = await Blog.findById(blogId)

    if(!blog) return sendResponse(res, 400, false, "Blog not found!")

    blog.remove()

    return res.status(200).json({
        success: true,
        message: "Blog deleted successfully"
    })
})

exports.searchBlogByTitle = BigPromise(async (req, res, next) => {

    const searchQuery = req.query.query
    
    const blogs = await Blog.find({
        title: {
            $regex: searchQuery,
                $options: "i"
        }
    })

    if(blogs.length == 0) return sendResponse(res, 401, false, `No blogs found for ${searchQuery}`)

    return res.status(200).json({
        count: blogs.length,
        blogs
    })
})

exports.searchBlogByKeywords = BigPromise(async (req, res, next) => {

    const searchQuery = req.query.query.split(',')
    console.log(req.query.query.split(','));
    
    const blogs = await Blog.find({
        keywords : { $in: searchQuery }
    })

    if(blogs.length == 0) return sendResponse(res, 401, false, `No blogs found for ${searchQuery}`)

    return res.status(200).json({
        count: blogs.length,
        blogs
    })
})

exports.updateBlog = BigPromise(async (req, res,next) => {
    const {
        title, 
        description,
        content,
        keywords
    } = req.body

    const id = req.params.id

    if(!id || !title || !description || !content || !keywords){
        return sendResponse(res, 400, false, "id, title, description, content, keywords are required!")
    }

    const blog = await Blog.findByIdAndUpdate(id,{title, description,content,keywords},{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res.status(200).json({
        success: true,
        blog
    })
})

exports.searchBlogByUserID = BigPromise(async (req, res, next) => {

    const user_id = req.query.id
    
    if(!user_id) return sendResponse(res, 400, false, "User id parameter is required!")

    const blogs = await Blog.find({
        user : user_id
    })

    if(blogs.length == 0) return sendResponse(res, 401, false, `No blogs found for user`)

    return res.status(200).json({
        count: blogs.length,
        blogs
    })
})

exports.likeBlog = BigPromise(async (req, res, next) => {
    const id = req.params.id

    if(!id) return sendResponse(res, 400, false, "id parameter is required!")

    const user_id = req.user._id
    const blog = await Blog.findById(id)

    if(!blog) return sendResponse(res, 401, false, "Blog not found!")

    let likes = blog.likes
    let numberOfLikes = blog.numberOfLikes

    if(likes.includes(user_id)){
        likes.remove(user_id)
        numberOfLikes = numberOfLikes - 1
    }else{
        likes.push(user_id)
        numberOfLikes = numberOfLikes + 1
    }

    blog.likes = likes
    blog.numberOfLikes = numberOfLikes

    await blog.save({validateBeforeSave :  false})

    res.status(200).json({
        success: true,
        blog
    })

    
    
})

exports.postComment = BigPromise(async (req, res, next) => {

    const id = req.params.id
    const {comment} = req.body
    if(!id || !comment) return sendResponse(res, 400, false, "id parameter and comment are required!")

   const commentToAdd = {
       user: req.user._id,
       name: req.user.name,
       comment
   }
    const blog = await Blog.findById(id)
    
    const alreadyCommented = blog.comments.find((com) => com.user.toString() === req.user._id.toString())

   if(alreadyCommented) {
       blog.comments.forEach(element => {
           if(element.user.toString() === req.user._id.toString()){
               element.comment = comment,
               element.name = req.user.name
           }
       });
   } else {
       blog.comments.push(commentToAdd)
   }


    await blog.save({validateBeforeSave: false})
    res.status(200).json({
        success: true,
        comments : blog.comments.length,
        blog
    })
})

