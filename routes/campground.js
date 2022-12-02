const express = require('express')
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const ExpressError = require('../utils/ExpressError')
const {campgroundSchema} = require('../schemas')
const {isLoggedIn,validateCampground, isAuthor} = require('../middleware')
const Joi = require('joi')

const multer  = require('multer')

const {storage} = require('../cloudinary')
const upload = multer({ storage })

const campgrounds  = require('../controllers/campgrounds')


const router = express.Router()


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post( isLoggedIn,upload.array('image'),validateCampground, catchAsync(campgrounds.createCampgrounds))


//  put this route before /:id else it's broke the applicatoin
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, upload.array('image'),validateCampground,isAuthor, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground ))



router.get('/:id/edit', isLoggedIn, catchAsync(campgrounds.renderEditForm))


module.exports  = router