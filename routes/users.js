var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');

var users = require('../models/users');
var verify    = require('./verify');
var transformers = require('../models/transformers')

/* GET users listing. */
router.get('/', verify.verifyOrdinaryUser, verify.verifyAdmin, function(req, res, next) {
            
    users.find({}, function(err, allUser){
        if(err) {next (err); return;}
        res.json(allUser);
    });                
});


router.delete('/:username', verify.verifyOrdinaryUser, verify.verifyAdmin, function(req, res, next) {
            
    var userName = req.params.username.toString();

    users.findOneAndRemove({username : userName}, function(err, resp){
        if(err){
            next (err);
            return;
        }
        
        if (resp == null)
           return res.status(404).json({status: 'Delete Unsuccessful!'});
        else
           return res.status(200).json({status: 'Delete Successful!'});
        
    });                
});


router.post('/register', function(req, res) {
    console.log(req.body);
    users.register(new users({ username : req.body.username }),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        
        if(req.body.company) {
            user.company = req.body.company;
        }
        
        if(req.body.email) {
            user.email = req.body.email;
        }
        
        if(req.body.tel.areaCode) {
            user.tel.areaCode = req.body.tel.areaCode;
        }

        if(req.body.tel.number) {
            user.tel.number = req.body.tel.number;
        }
        
        user.save(function(err,user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({status: 'Registration Successful!'});
            });
        });
    });
});


router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
        
      var token = verify.getToken(user);
        res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});


router.post('/reset', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
      
    user.setPassword(req.body.newPassword, function(err) {
        if (err) {
          return res.status(500).json({
             err: 'Could not Set New Password'
          });
        }

        user.save(function (err, user) {

            if (err){ 
                console.log(err);
                next (err);
                return;
            }

            res.status(200).json({
            status: 'Change successful!',
        });            
      });
    });
  })(req,res,next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
    status: 'Bye!'
  });
});


router.put('/link/transformer', verify.verifyOrdinaryUser, verify.verifyAdmin, 
    function(req, res, next){

    // Save the Transformer reference in the required user
    users.findOne({username : req.body.username})
         .populate('userTransformers')
         .exec(function(err, user){
         if(err || (user == null)) {
            console.log(err);
            next (err);
            return;
         } 
             
        transformers.findOne({transformerId : req.body.transformerId})
            .exec(function(err, transformer){
            if(err || (transformer == null)) {
                console.log(err);
                next (err);
                return;
            }

            var isPresent = false;
            for (i = 0; i < user.userTransformers.length; i++) {
                if (user.userTransformers[i].transformerId == req.body.transformerId)
                {
                   isPresent = true;
                   break;
                }
            }

            if (isPresent)
            {
                console.log("User Already Linked", user.username);
                return res.status(405).json({err: "User Already Linked"});
            }
            
            user.userTransformers.unshift(transformer._id);                    
            user.save(function (err, user) {

                if (err){ 
                    console.log(err);
                    next (err);
                    return;
                }

                console.log('Updated Transformer in Required user!');
                res.writeHead(200, {'Content-type': 'text/plain'});
                res.end('Linked Transformer with User');             
            });    
        }); 
    });
});

router.put('/unlink/transformer', verify.verifyOrdinaryUser, verify.verifyAdmin, 
           function(req, res, next){

    // Save the Transformer reference in the required user
    users.findOne({username : req.body.username})
         .populate('userTransformers')
         .exec(function(err, user){
         if(err || (user == null)) {
            console.log(err);
            next (err);
            return;
         } 
             
        transformers.findOne({transformerId : req.body.transformerId})
            .exec(function(err, transformer){
            if(err || (transformer == null)) {
                console.log(err);
                next (err);
                return;
            }

            // Remove the transformer reference
            var removed = false;
            
            for (var i = 0; i < user.userTransformers.length; i++) {

                if (user.userTransformers[i].transformerId == req.body.transformerId){
                   user.userTransformers.splice(i, 1);
                   removed = true;
                   break;
                }
            }
            
            if (!removed)
               return res.status(404).json({err: "User not Linked to transformer"});    
            
            user.save(function (err, user) {

                if (err){ 
                    console.log(err);
                    next (err);
                    return;
                }

                console.log('Removed Transformer in Required user!');
                res.writeHead(200, {'Content-type': 'text/plain'});
                res.end('Unlinked Transformer with User');             

            });    
        }); 
    });
});



module.exports = router;
