if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
console.log(process.env.CLOUDINARY_KEY)

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
const dbUrl = process.env.DB_URL

const MongoStore = require('connect-mongo');



const Joi = require('joi')
const methodOverride = require('method-override')
app.use(methodOverride('_method'))  

const User = require('./models/user')

const helmet = require('helmet')

// used for passport.js
const passport = require('passport')
const localStrategy = require('passport-local')





const uri = dbUrl
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

const mongoSanitize = require('express-mongo-sanitize')
app.use(mongoSanitize({
    replaceWith: '_'
}))

const store = new MongoStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60
})

store.on('error', function(e){
    console.log('Session Store Error', e)
})

const sessionConfig = {
    store,
    // change your default name
    name: 'session',
    secret: 'thisshouldbeabettersecret!', 
    resave: false, 
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // don't use this on development it's break thing
        // secure: true,
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
        console.log(req.query)
        // add this line for checking whether user is logged in or not
        res.locals.currentUser = req.user
        // check session 
         console.log(req.session)

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

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);













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
