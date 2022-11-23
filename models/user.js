const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {
        type: String,
        required:  true,
        unique: true
    }
})

// this code add unique @USERNAME and PWD automatically
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User' , UserSchema)