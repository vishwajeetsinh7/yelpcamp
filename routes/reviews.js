const express = require('express')
const router = express.Router({mergeParams: true})

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const Review = require('../models/review')
const Campground = require('../models/campground')

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')






// review route
router.post('/', validateReview, isLoggedIn ,catchAsync(async (req,res) => {
    const campground =await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'created review')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(async(req,res) => {
    // res.send('delete me ')
    const {id, reviewId}  = req.params
    const campground =  await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}})
    await  Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Deleted Review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router 