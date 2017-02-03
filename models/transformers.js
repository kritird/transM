// Import required modules
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// Define the Data Schema
var dataSchema = new Schema({
    
// Health From Controller
    health:{
        type: String,
        required: true,
    },
    
// Output Voltages    
    voltageVr:  {
        type: Number,
        min: 0,
        max: 10000,
        required: true
    },
    voltageVy:  {
        type: Number,
        min: 0,
        max: 10000,
        required: true
    },
    voltageVb:  {
        type: Number,
        min: 0,
        max: 10000,
        required: true
    },

// Output Currents
    currentIr:  {
        type: Number,
        min: 0,
        max: 10000,
        required: true
    },
    currentIy:  {
        type: Number,
        min: 0,
        max: 10000,
        required: true
    },
    currentIb:  {
        type: Number,
        min: 0,
        max: 10000,
        required: true
    },

// Winding Temperature
    windingTemperature:  {
        type: Number,
        required: false
    },

    surfaceTemperature:  {
        type: Number,
        required: false
    },
    
// Oil Temperature
    oilTemperature:  {
        type: Number,
        required: false
    }
    },

// Need the time of each record                            
    {
    timestamps: true
});


// Transformer Schema
var transformerSchema = new Schema({
    
    transformerId: {
        type: String,
        required: true,
        unique: true
    },
    
    company: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },
    
    type:{
        type: String,
        required: true,
    },
    
    subType:{
        type: String,
        required: false,
        default: ''
    },

    health:{
        type: String,
        required: false,
        default: 'GOOD'
    },
    
    status:{
        type: String,
        required: false,
        default: 'OFF'
    },

    voltageRating:{
        type: Number,
        required: true
    },
    
    currentRating:{
        type: Number,
        required: true
    },
    
    overVoltageThreshold: {
        type: Number,
        required: true
    },

    underVoltageThreshold: {
        type: Number,
        required: true
    },

    overLoadThreshold: {
        type: Number,
        required: true
    },
    
    underLoadThreshold: {
        type: Number,
        required: true
    },
    
    oilTemperatureThreshold: {
        type: Number,
        required: false,
        default: 0
    },

    windingTemperatureThreshold: {
        type: Number,
        required: false,
        default: 0
    },
       
    surfaceTemperatureThreshold: {
        type: Number,
        required: false,
        default: 0
    },
        
    description: {
        type: String,
        required: false,
        default:''
    },
    
    controllerToken: {
        type: String,
        required: false,
        default:''
    },
    
    data:[dataSchema]
}, 
{
    timestamps: true
});


var transformers = mongoose.model('transformer', transformerSchema);

// make this available to our Node applications
module.exports = transformers;