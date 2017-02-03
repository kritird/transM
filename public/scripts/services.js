'use strict';

angular.module('transMApp')

        // base URL setup
        .constant("baseURL","https://transm-157601.appspot.com/")

        // Main Authentication Service
        .service('auth', ['$window', function ($window) {
            
          var self = this;

          // Parse the token
          self.parseJwt = function(token) {
                
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
                
            return JSON.parse($window.atob(base64));
          }
          
          // Save the token
          self.saveToken = function(token) {
              
            $window.localStorage['jwtToken'] = token;
              
          }
          
          self.saveHttpStatus= function(status){
            $window.localStorage['httpStatus'] = status;
          }

          self.getHttpStatus = function(){
            return $window.localStorage['httpStatus'];
          }

          // Fetch the token
          self.getToken = function() {
            return $window.localStorage['jwtToken'];
          }

          // Is Authenticated ?
          self.isAuthed = function() {
            var token = self.getToken();
              
            if(token) {
              var params = self.parseJwt(token);
              console.log('parsedToken', params);

              return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
              return false;
            }
          }
          
          self.getTokenUser = function(){
            var token = self.getToken();
              
            if(token) {
              var params = self.parseJwt(token);
              return params._doc;    
            } else return null;
              
          }
          
          // Logout User
          self.logout = function() {
            $window.localStorage.removeItem('jwtToken');
          }
 
        }])

        // Authentication Interceptor Factory
        .factory('authInterceptor', ['$injector','baseURL',
                                     
          function ($injector, baseURL) {
              
          var auth= $injector.get('auth');

          return {
              
            // automatically attach Authorization header
            request: function(config) {
                
              var token = auth.getToken();
              if(config.url.indexOf(baseURL) === 0 && token) {
                config.headers['x-access-token'] =  token;
              }

              return config;
            },

            // If a token was sent back, save it
            response: function(res) {
                
              if(res.config.url.indexOf(baseURL) === 0 && res.data.token) {
                auth.saveToken(res.data.token);
              }
              
              auth.saveHttpStatus(res.status);
                
              return res;
            },
          }
          
        }])

         
        .service('user', ['$resource', 'baseURL', 
            function ($resource, baseURL) {
    
                              
            this.register = function(){

              return $resource (baseURL+"users/register", null,
                               {'update': {method:'PUT'}});
            }

            this.login = function(){

              return $resource (baseURL+"users/login", null,
                               {'update': {method:'PUT'}});
            }

            this.reset = function(){

              return $resource (baseURL+"users/reset", null,
                               {'update': {method:'PUT'}});
            }

            this.users = function(){

              return $resource (baseURL+"users/:username", null,
                               {'update': {method:'PUT'}});
            }

            this.logout = function(){

              return $resource (baseURL+"users/logout", null,
                               {'update': {method:'PUT'}});
            }

            this.link = function(){

              return $resource (baseURL+"users/link/transformer", null,
                               {'update': {method:'PUT'}});
            }

            this.unlink = function(){

              return $resource (baseURL+"users/unlink/transformer", null,
                               {'update': {method:'PUT'}});
            }

        }])

        // Push the Token in the Request
        .config(['$httpProvider', function($httpProvider) {
          $httpProvider.interceptors.push('authInterceptor');
        }])


        //menuFactory
        .service('transformerFactory',  ['$resource', 'baseURL','$http', 
            function($resource, baseURL, $http) {

            this.transformers = function(){

              return $resource (baseURL+"transformer/:transformerId", null,
                               {'update': {method:'PUT'}});
            };
            
            var transformer = [];
            this.saveTransformer = function(trans){
                 if (transformer.length){
                    transformer.pop();
                 }
                
                 transformer.unshift(trans);
            }

            this.getTransformer = function(){
                 return transformer[0];
            }
            
        }])

        // corporateFactory
        .factory('corporateFactory', ['$resource', 'baseURL', function($resource, baseURL) {

            var corpfac = {};

            corpfac.getLeader = function () {

              return $resource (baseURL+"leadership/:id", null,
                               {'update': {method:'PUT'}});
            };

            return corpfac;

        }])

        //menuFactory
        .service('feedbackFactory',  ['$resource', 'baseURL', function($resource, baseURL) {


        this.getFeedback = function(){

          return $resource (baseURL+"feedback", null,
                           {'update': {method:'PUT'}});
        };


        }])


;
