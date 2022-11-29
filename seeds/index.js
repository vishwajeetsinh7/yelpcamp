
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const uri = "mongodb+srv://vishwajeet:vishwajeet@quizzapp.8cryywh.mongodb.net/test"
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

const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async() => {
    await Campground.deleteMany({})
    for(let i=0; i<50; i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20 + 10)
        const camp = new Campground({
            author:  '63859de347f87abaec663ad4',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://images.unsplash.com/photo-1669570094762-828f3dfaf675?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80`,
            description: 'this is very good place i like so much this place. good hotels and restorants and resorts',
            price 
        })
        await camp.save()
    }
}

seedDB().then( ()=> {
    mongoose.connection.close()
})