// Imports
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// This will crypto the Password field in the User model
var passportLocalMongoose = require('passport-local-mongoose');

// User Schema
var user = new Schema({
    username: String,
    password: String,
    company: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''        
    },
    tel:{
        areaCode:Number,
        number:Number,
        default: 0
    },
    userTransformers : [{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'transformer'
    }],
    admin:   {
        type: Boolean,
        default: false
    }
});


// This will crypto the Password field in the User model
user.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', user);