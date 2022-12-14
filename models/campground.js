const mongoose = require('mongoose')
const Review = require('./review')
const User = require('./user')
const Schema = mongoose.Schema


const ImageSchema = new Schema({
    url: String, 
    filename: String
})

ImageSchema.virtual('thumbnail').get(function async(){
   return  this.url.replace('/upload/', '/upload/w_100,ar_1.0,c_fill/r_max/')
})


const opts = {toJSON: {virtuals : true}}

const campgroundSchema = new Schema({
    title: String, 
    price: Number,
    images: [ImageSchema],
    geometry:{
        type: {
            type: String, 
            enum: ['Point'],
            required: true
        }, 
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String, 
    location: String, 
    author: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    } ,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)


 campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return  `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`
 })

campgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({ 
            _id: {
                $in: doc.reviews
            }
        })
    }
    console.log(doc)
})

module.exports = mongoose.model('Campground', campgroundSchema)
