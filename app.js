const express = require('express')
const app = express()
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
const port = process.env.PORT || 3000 
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const userRoutes  = require('./routes/users')


const Joi = require('joi')
const methodOverride = require('method-override')
app.use(methodOverride('_method'))  

const User = require('./models/user')

// used for passport.js
const passport = require('passport')
const localStrategy = require('passport-local')





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

// without this parsing the body data is not workng
app.use(express.urlencoded({extended:true}))

//  this is used for serving static file public directory
// app.use(express.static('public'))

app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!', 
    resave: false, 
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60  * 24 * 7,
        maxAge: 1000 * 60 * 60  * 24 * 7
    }
}
app.use(session(sessionConfig))
// make sure that u use sessioconfig before it
app.use(passport.initialize())
app.use(passport.session(session))

passport.use(new localStrategy(User.authenticate()))
// store user in session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use(flash())

    // create a middleware for each and every route on ./app.js
    app.use((req,res,next) => {
        res.locals.success = req.flash('success')
        res.locals.error = req.flash('error')
        next()
    })

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)



app.get('/', (req, res) => {
    res.render('home')
})











// app.all('*', (req,res,next) => {
//     next(new ExpressError('Page not Found', 404))
    
// })


app.use((err, req, res ,next) =>{
    const {statusCode = 500, message = 'Somethign not Riiight'} = err
    if(!err.message) err.message = 'Oh there is something Wrong'
    res.status(statusCode).render('error', {err})
})


app.listen(port, () => {
    console.log(`Yelpcamp running on http://localhost:${port}`)
})
