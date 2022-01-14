const mongoose = require('mongoose')

exports.connectToDB = () => {
    mongoose.connect(process.env.MONGODB_URL, () => {
        console.log("DB CONNECTED SUCCESSFULLY");
    })
}