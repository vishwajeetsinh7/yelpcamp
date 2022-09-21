const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Campground = require('./models/campground')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, 
    // useCreateIndex: true, 
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open',() =>{
    console.log('dababase connected :)')
})

const path = require('path')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

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

app.post('/campgrounds', async (req,res)=>{
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground})
})


app.listen(3000, () => {
    console.log('App is running on port 3000')
})
