const express = require('express')
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const ExpressError = require('../utils/ExpressError')
const {campgroundSchema} = require('../schemas')
const {isLoggedIn,validateCampground, isAuthor} = require('../middleware')
const Joi = require('joi')


const router = express.Router()





router.get('/', async(req,res) => {
    const campgrounds  = await Campground.find({})
    res.render('campgrounds/index',{campgrounds})
})

router.get('/new', isLoggedIn,(req,res) => {
    res.render('campgrounds/new')
})

router.post('/', validateCampground, isLoggedIn, catchAsync(async (req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid CampGround data', 400)
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id    
    await campground.save()
    req.flash('success', 'Successfully made a new campground!')
        res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', 
        populate: {
            path: 'author'
        }
    }).populate('author')
    
    console.log(campground)
    if(!campground){
        req.flash('error', 'Canot find that campgroud')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}))
 
router.get('/:id/edit', isLoggedIn, catchAsync(async(req,res)=>{
    const {id} = req.params
    const campground = await Campground.findById(id)
    // const camp = await   Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', 'Canot find that campgroud')
        return res.redirect('/campgrounds')
    }
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do That')
        return res.redirect(`/campgrounds/${id}`)
    }
    res.render('campgrounds/edit', {campground})
}))

    router.put('/:id/' , isLoggedIn,validateCampground,isAuthor, catchAsync(async(req,res) => {
        const {id} = req.params

        const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground})
        req.flash('success', 'Successfully updated Campground')
        res.redirect(`/campgrounds/${camp._id}`)
    }))

router.delete('/:id/', isLoggedIn,isAuthor, catchAsync(async(req,res) => {
    const {id} = req.params
    const campgroud =   await Campground.findByIdAndDelete(id)
    req.flash('success', `deleted ${campgroud.title} campground`)
    res.redirect('/campgrounds')

}))


module.exports  = router