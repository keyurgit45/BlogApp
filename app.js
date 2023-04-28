require('dotenv').config()
const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const cookieParser = require('cookie-parser')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))

//clodinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})


//database connection
require('./config/db').connectToDB();

//morgan
app.use(morgan('tiny'))

//routes
const home = require('./routes/home')
const user = require('./routes/user');
const blog = require('./routes/blog');

app.use('/api/v1', home)
app.use('/api/v1', user)
app.use('/api/v1', blog)

module.exports = app;