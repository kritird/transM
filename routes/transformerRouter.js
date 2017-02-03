// Import required modules
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
    

// Parse the Request JSON
router.use(bodyParser.json());

// Import the model and verify
var transformers = require('../models/transformers');
var users        = require('../models/users');

var verify = require('./verify');


/*----------------------------------------------+
|              Transformer Route                |
+----------------------------------------------*/

router.route('/')

// Verify User for all routes 
.all(verify.verifyOrdinaryUser)


// Get all Transformers under the User
.get(function(req,res,next){
    
    users.findById(req.decoded._doc._id)
        .populate('userTransformers')
        .exec(function(err, user){
        if(err) {
            console.log(err);
            next (err);
            return;
        }
        res.json(user.userTransformers);
    });    
})

// Create a new Transformer
.post(verify.verifyAdmin, function(req, res, next){

    // Create the Controller Token first
    req.body.controllerToken = verify.getControllerToken(req.body);
    
    var data = {};
    data.controllerToken = req.body.controllerToken;
    
    // Create the Transformer Record
    transformers.create(req.body, function(err, transformer){
        
        if(err){ 
            console.log(err);
            next (err);
            return;
        }
        
        // Save Transformer Reference in Admin User
        users.findById(req.decoded._doc._id)
             .exec(function(err, admin){
             if(err) {
                console.log(err);
                next (err);
                return;
             }
             admin.userTransformers.unshift(transformer._id);
             admin.save(function (err, admin) {

                if (err){ 
                    console.log(err);
                    next (err);
                    return;
                }

                console.log('Updated Transformer in Admin user!');
                 
                console.log('New Transformer Created!' + transformer._id);
                res.json(data);   
                                  
            });
        });    
      
    });

});


/*----------------------------------------------+
|          ID Based Transformer Route           |
+----------------------------------------------*/
router.route('/:transformerId')


.get(verify.verifyOrdinaryUser, function(req,res,next){
    
    var sTransformerId = req.params.transformerId.toString();

    transformers.findOne({transformerId : sTransformerId})
        .exec(function(err, transformer){
        if(err || (transformer == null)) {
            console.log(err);
            next (err);
            return;
        }else{
        res.json(transformer);}
    });    
})


// Data from Controller
.post(verify.verifyControllerToken, function(req, res, next){
    
    var sTransformerId = req.params.transformerId.toString();
    
    
    transformers.findOne({transformerId : sTransformerId})
        .exec(function(err, transformer){
        if(err || (transformer == null)) {
            console.log(err);
            next (err);
            return;
        }else{
        // Keep only 100 latest data
        if (transformer.data){
            if (transformer.data.length >= 3600){
                transformer.data.pop();}      
        }
        else{
            transformer.data = [];
        }
            
        // Add the new data
        transformer.data.unshift(req.body);
        
        // Set the transformer Health and Status
        transformer.health = req.body.health;
        
        if (req.body.health == 'DOWN'){
            transformer.status = 'OFF';
        }else{
            transformer.status = 'RUNNING';
        }
        
        transformer.save(function(err, resp){
            if(err) {
                console.log(err);
                next (err);
                return;
            }
            
            console.log('New Transformer Data Added for Transformer!' + transformer._id);
            res.json(resp);
        });}
    });   
})

.delete(verify.verifyOrdinaryUser, verify.verifyAdmin, function(req, res, next){
    
    console.log('We are in delete');
    
    // Find the Transformer to Delete
    transformers.findOne({transformerId : req.params.transformerId})
        .exec(function(err, transformer){
                if(err || (transformer == null)) {
                    console.log(err);
                    next (err);
                    return;
                }
                
                // Find the User Associated with the transformer
                users.find({})
                    .populate('userTransformers')
                    .exec(function(err, userList){
                        if (err){
                            console.log(err);
                            next (err); 
                            return;
                        }
                        
                        var error = false;
                        console.log('Users :', users);
                        // Delete the Transformer Reference From User
                        for (i=0; i < userList.length; i++)
                        {
                            error = false;
                            userList[i].userTransformers.remove({_id: transformer._id},
                                function(err){
                                    error = true;;
                                });
                    
                            if (error) continue;
                            
                            userList[i].save(function (err, resp) {
                            if (err){
                                console.log(err);
                                next (err);
                                return;
                            }                        
                            });
                        }
                    
                        transformers.findOneAndRemove({transformerId : req.params.transformerId})
                                .exec(function(err){
                                    if(err) {
                                        console.log(err);
                                        next (err);
                                        return;
                                    }

                                    res.status(200).json({status: 'Remove Successful!'});
                        });                    
                });
        });
});

module.exports = router;