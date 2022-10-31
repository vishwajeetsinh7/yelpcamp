const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
const ejsMate = require('ejs-mate')

const ExpressError = require('./utils/ExpressError')
const {campgroundSchema, reviewSchema} = require('./schemas')
const catchAsync = require('./utils/catchAsync')


const Joi = require('joi')
// this is used for put or delete request npm i method-override
const methodOverride = require('method-override')
app.use(methodOverride('_method'))  

const uri = "mongodb+srv://vishwajeet:vishwajeet@quizzapp.8cryywh.mongodb.net/test"
// const uri = "mongodb://0.0.0.0"
async function connect(){
    try{
        await mongoose.connect(uri)
        console.log('connected to online MDB')
    }catch(error){
        console.log(error)
    }
}
connect()

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open',() =>{
    console.log('dababase connected :)')
})

const path = require('path')

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


const validateCampground = (req,res,next) =>{

    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next()
    }

}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next()
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/makecampground',async (req, res)=>{
    const camp = new Campground({title: 'My Backyard', description: 'cheap camping!'})
    await camp.save()
    res.send(camp)
})

app.get('/campgrounds', async(req,res) => {
    const campgrounds  = await Campground.find({})
    res.render('campgrounds/index',{campgrounds})
})

app.get('/campgrounds/new', (req,res) => {
    res.render('campgrounds/new')
})
// without this parsing the body data is not workng
app.use(express.urlencoded({extended:true}))


app.post('/campgrounds', validateCampground, catchAsync(async (req,res,next)=>{

    if(!req.body.campground) throw new ExpressError('Invalid CampGround data', 400)
    const campground = new Campground(req.body.campground)
        await campground.save()
        res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews')
    console.log(campground)
    res.render('campgrounds/show', {campground})
}))
 
app.get('/campgrounds/:id/edit', catchAsync(async(req,res)=>{
    const campground = await   Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

app.put('/campgrounds/:id/',validateCampground, catchAsync(async(req,res) => {
    const {id} = req.params
    const campground = await    Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/', catchAsync(async(req,res) => {
    const {id} = req.params
    const campground =   await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')

}))

// review route
app.post('/campgrounds/:id/reviews', validateReview ,catchAsync(async (req,res) => {
    const campground =await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req,res) => {
    // res.send('delete me ')
    const {id, reviewId}  = req.params
    const campground =  await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}})
    await  Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))


app.all('*', (req,res,next) => {
    next(new ExpressError('Page not Found', 404))
    
})
app.use((err, req, res ,next) =>{
    const {statusCode = 500, message = 'Somethign not Riiight'} = err
    if(!err.message) err.message = 'Oh there is something Wrong'
    res.status(statusCode).render('error', {err})
})


app.listen(3000, () => {
    console.log('App is running on port 3000')
})
