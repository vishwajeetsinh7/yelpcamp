const  mongoose = require('mongoose')
const  User = require('./user')
const Schema = mongoose.Schema

const reviewSchema = new Schema ({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }
}) 

module.exports = mongoose.model('Review', reviewSchema)