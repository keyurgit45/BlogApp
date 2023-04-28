const express = require('express')
const { createBlog, myBlogs, deleteBlog, searchBlogByTitle, searchBlogByKeywords, updateBlog, searchBlogByUserID, likeBlog, postComment } = require('../controllers/blogController')
const { isLoggedIn } = require('../middleware/user')

const router = express.Router()

router.route('/blog/new').post(isLoggedIn, createBlog)
router.route('/blog/myblogs').get(isLoggedIn, myBlogs)
router.route('/blog/delete/:blogId').get(isLoggedIn, deleteBlog)

router.route('/blog/searchbytitle').get( searchBlogByTitle)
router.route('/blog/searchbykeywords').get( searchBlogByKeywords)
router.route('/blog/searchbyuserid').get( searchBlogByUserID)

router.route('/blog/update/:id').get(isLoggedIn, updateBlog)

router.route('/blog/like/:id').get(isLoggedIn, likeBlog)
router.route('/blog/comment/:id').post(isLoggedIn, postComment)

module.exports = router 