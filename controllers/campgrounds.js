const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

const {cloudinary} = require('../cloudinary')


module.exports.index = async(req,res) => {
    const campgrounds  = await Campground.find({})
    res.render('campgrounds/index',{campgrounds})
}


module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new')
}

module.exports.createCampgrounds = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // res.send()
    
    if(!req.body.campground) throw new ExpressError('Invalid CampGround data', 400)
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images =     req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id    
    await campground.save()
    req.flash('success', 'Successfully made a new campground!')
        res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.showCampground = async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', 
        populate: {
            path: 'author'
        }
    }).populate('author')

    if(!campground){
        req.flash('error', 'Canot find that campgroud')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}

module.exports.renderEditForm = async(req,res)=>{
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
}


module.exports.updateCampground = async(req,res) => {
    const {id} = req.params
    // console.log(req.body)

    const campgroud = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    campgroud.images.push(...imgs)
    await campgroud.save()
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
       await  campgroud.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
       console.log(campgroud)
    }


    req.flash('success', 'Successfully updated Campground')
    res.redirect(`/campgrounds/${campgroud._id}`)
}


module.exports.deleteCampground = async(req,res) => {
    const {id} = req.params
    const campgroud =   await Campground.findByIdAndDelete(id)
    req.flash('success', `deleted ${campgroud.title} campground`)
    res.redirect('/campgrounds')

}