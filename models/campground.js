const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema
const campgroundSchema = new Schema({
    title: String, 
    price: Number,
    image: String,
    description: String, 
    location: String,  
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
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
