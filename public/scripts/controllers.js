'use strict';

angular.module('transMApp')

        // Header Controller
        .controller('HeaderController', ['$rootScope', '$scope', 'auth', '$state','user',
          function($rootScope, $scope, auth, $state, user) {
            
            $scope.isAuth = auth.isAuthed();
              
            $rootScope.$on('$stateChangeSuccess', function() {
              $scope.isAuth = auth.isAuthed();
            });
              
            $scope.logout = function(){
                auth.logout();
                user.logout().get();
                $scope.isAuth = false;
                $state.go('app');
            }  
              
        }])

        // Main Controller
        .controller('MainController', ['$scope', 'auth', 'transformerFactory','$state',
          function($scope, auth, transformerFactory, $state) {
              
            if(!auth.isAuthed()){
              $state.go('app.login');
            }    

            $scope.user = auth.getTokenUser();
              
            $scope.showTransformer = false;
              
            $scope.transformers = transformerFactory.transformers().query(
              function(response) {
                  $scope.transformers = response;
                  
                  if (response[0].transformerId == null)
                     $scope.showTransformer = false;
                  else{
                     $scope.showTransformer = true;
                     transformerFactory.saveTransformer(response[0]);
                  }   
              },
              function(response) {
                  $scope.showTransformer = false;
              }
            );
        }])

        .controller('DashboardController', ['$scope', 'auth', '$stateParams',       'transformerFactory','$state', '$rootScope', '$window',
          function($scope, auth, $stateParams, transformerFactory, 
                   $state, $rootScope, $window  ) {
                        
          if(!auth.isAuthed()){
              $state.go('app.login');
          }
        
          $window.scrollTo(0, 0);

              
          // Get the Transformer       
          $scope.transformer = transformerFactory.transformers()
              .get({transformerId:$stateParams.transformerId},
              function(response) {
                  console.log(response);
                  $scope.transformer = response;
                  $scope.showTransformer = true;
                  if (typeof response.data != 'undefined' &&
                     response.data.length > 0)
                  {
                      $scope.showData = true;                         
                  }
                  else{
                      $scope.showData = false;   
                  }
              },
              function(response) {
                  $scope.showTransformer = false;
              }
            );
            
            var interval = setInterval(refreshData, 1000);

            // Fetch Latest Transformer Data
            function refreshData() {

              if ($scope.showData) {
                  transformerFactory.transformers()
                      .get({transformerId:$stateParams.transformerId},
                      function(response) {

                          $scope.tData = response.data;
                          if ($scope.transformer.health != $scope.tData[0].health)
                           {
                              $scope.transformer.health = $scope.tData[0].health;
                              if ($scope.transformer.health == 'DOWN')
                                 $scope.transformer.status = 'OFF'; 
                           }
                      },
                      function(response) {
                          return;
                      }
                    );
              }
                
            }     

            $rootScope.$on('$stateChangeStart', function(){
                
                clearInterval(interval);
            })

        }])

        .controller('VoltageController', ['$scope', 'auth', '$rootScope',
          function($scope, auth, $rootScope) {

            var vInterval  =  setInterval(refreshData, 1000);

            $rootScope.$on('$stateChangeStart', function(){
                
                clearInterval(vInterval);
            })

            $scope.options = {
                    chart: {
                        type: 'lineChart',
                        height: 350,
                        margin : {
                            top: 20,
                            right: 20,
                            bottom: 40,
                            left: 55
                        },
                        x: function(d){ return d.x; },
                        y: function(d){ return d.y; },
                        useInteractiveGuideline: true,
                        dispatch: {
                            stateChange: function(e){ console.log("stateChange"); },
                            changeState: function(e){ console.log("changeState"); },
                            tooltipShow: function(e){ console.log("tooltipShow"); },
                            tooltipHide: function(e){ console.log("tooltipHide"); }
                        },
                        xAxis: {
                            axisLabel: 'Time (secs)'
                        },
                        yAxis: {
                            axisLabel: 'Voltage (v)',
                            tickFormat: function(d){
                                return d3.format('.02f')(d);
                            },
                            axisLabelDistance: -10
                        },
                        callback: function(chart){
                            console.log("!!! lineChart callback !!!");
                        }
                    },
                    title: {
                        enable: true,
                        text: 'Voltage Analysis'
                    },
                    subtitle: {
                        enable: true,
                        text: 'The graph shows the Voltage Data for last 1 hour',
                        css: {
                            'text-align': 'center',
                            'margin': '10px 13px 0px 7px'
                        }
                    },
                };
              
                function refreshData() {
                    if ($scope.$parent.showData){
                        $scope.showVGraph=true;
                        $scope.data = getData();
                    }
                    else{
                        $scope.showVGraph=false;                    
                    }

                }

                function getData() {

                    var data = $scope.$parent.tData;
                    
                    var vr = [],vy = [],
                        vb = [];

                    var j = data.length -1;
                    
                    //Data is represented as an array of {x,y} pairs.
                    for (var i = 0; i < data.length; i++) {
                        vr.push({x: i, y: data[j].voltageVr});
                        vy.push({x: i, y: data[j].voltageVy});
                        vb.push({x: i, y: data[j].voltageVb});
                        j--;
                    }

                    //Line chart data should be sent as an array of series objects.
                    return [
                        {
                            values: vr,      //values - represents the array of {x,y} data points
                            key: 'Voltage (R)', //key  - the name of the series.
                            color: '#C0392B'  //color - optional: choose your own line color.
                        },
                        {
                            values: vy,
                            key: 'Voltage (Y)',
                            color: '#F39C12'
                        },
                        {
                            values: vb,
                            key: 'Voltage (B)',
                            color: '#2980B9',
                        }
                    ];
                };
              
        }])

        .controller('CurrentController', ['$scope', 'auth', '$rootScope',
          function($scope, auth, $rootScope) {

            var iInterval  =  setInterval(refreshData, 1000);

            $rootScope.$on('$stateChangeStart', function(){
                
                clearInterval(iInterval);
            })

            $scope.options = {
                    chart: {
                        type: 'lineChart',
                        height: 350,
                        margin : {
                            top: 20,
                            right: 20,
                            bottom: 40,
                            left: 55
                        },
                        x: function(d){ return d.x; },
                        y: function(d){ return d.y; },
                        useInteractiveGuideline: true,
                        dispatch: {
                            stateChange: function(e){ console.log("stateChange"); },
                            changeState: function(e){ console.log("changeState"); },
                            tooltipShow: function(e){ console.log("tooltipShow"); },
                            tooltipHide: function(e){ console.log("tooltipHide"); }
                        },
                        xAxis: {
                            axisLabel: 'Time (secs)'
                        },
                        yAxis: {
                            axisLabel: 'Current (I)',
                            tickFormat: function(d){
                                return d3.format('.02f')(d);
                            },
                            axisLabelDistance: -10
                        },
                        callback: function(chart){
                            console.log("!!! lineChart callback !!!");
                        }
                    },
                    title: {
                        enable: true,
                        text: 'Current Analysis'
                    },
                    subtitle: {
                        enable: true,
                        text: 'The graph shows the Current Data for last 1 hour',
                        css: {
                            'text-align': 'center',
                            'margin': '10px 13px 0px 7px'
                        }
                    },
                };
              
                function refreshData() {
                    if ($scope.$parent.showData){
                        $scope.showIGraph=true;
                        $scope.data = getData();
                    }
                    else{
                        $scope.showIGraph=false;                    
                    }

                }

                function getData() {

                    var data = $scope.$parent.tData;
                    
                    var ir = [],iy = [],
                        ib = [];

                    var j = data.length -1;
                    
                    //Data is represented as an array of {x,y} pairs.
                    for (var i = 0; i < data.length; i++) {
                        ir.push({x: i, y: data[j].currentIr});
                        iy.push({x: i, y: data[j].currentIy});
                        ib.push({x: i, y: data[j].currentIb});
                        j--;
                    }

                    //Line chart data should be sent as an array of series objects.
                    return [
                        {
                            values: ir,      //values - represents the array of {x,y} data points
                            key: 'Current (R)', //key  - the name of the series.
                            color: '#C0392B'  //color - optional: choose your own line color.
                        },
                        {
                            values: iy,
                            key: 'Current (Y)',
                            color: '#F39C12'
                        },
                        {
                            values: ib,
                            key: 'Current (B)',
                            color: '#2980B9',
                        }
                    ];
                };
              
        }])

        .controller('AddUserController', ['$scope', '$state', 'auth', 'user', 
          function ($scope, $state, auth, user) {

              if(!auth.isAuthed()){
                  $state.go('app.login');
              }      

              
              $scope.registerSuccess = false;
              $scope.registerError = false;

              function onRegisterSuccess(res) {
                  $scope.registerSuccess = true;
                  $scope.registerError = false;
                  $scope.register = 
                      {username:"", password:"", company:"", tel:{areaCode:0, number:0}, email:""};
                  $scope.registerForm.$setPristine();
              }

              function onRegisterError(res) {
                      $scope.registerError = true;
                      $scope.registerSuccess = false;
              }
              
              $scope.registerUser = function() {
                  user.register().save($scope.register)
                  .$promise.then(onRegisterSuccess, onRegisterError);
              }
              
          }])

        // The User Management Controller
        .controller('UserController', ['$scope', '$state', 'auth', 'user', 
          function ($scope, $state, auth, user) {
              
          var self = this;

          $scope.errorMessage = false;
              
          function onLoginSuccess(res) {
            var token = res.data ? res.data.token : null;
              
            if(token) { console.log('JWT:', token); }
            $state.go('app.main');
          }

          function onLoginError(res) {
            $scope.username = "";
            $scope.password = "";
            $scope.errorMessage = true;
          }

          function onResetSuccess(res) {
            $state.go('app.login');
          }

          function onResetError(res) {
            $scope.username = "";
            $scope.password = "";
            $scope.newPassword = "";
            $scope.confirmPassword = "";
            $scope.errorMessage = true;
          }
              
              
          $scope.registerSuccess = false;
          $scope.registerError = false;

          function onRegisterSuccess(res) {
              $scope.registerSuccess = true;
              $scope.registerError = false;
              $scope.register = 
                  {username:"", password:"", company:"", tel:{areaCode:0, number:0}, email:""};
              $scope.registerForm.$setPristine();
          }

          function onRegisterError(res) {
                  $scope.registerError = true;
                  $scope.registerSuccess = false;
          }

          function onSuccess(res) {
              $scope.success = true;
              $scope.error = false;
              $scope.username = "";
          }

          function onError(res) {
                  console.log(res);
                  $scope.error = true;
                  $scope.success = false;
          }

          $scope.login = function() {
            user.login().save({username: $scope.username, 
                             password: $scope.password})
              .$promise.then(onLoginSuccess, onLoginError);
          }
          
          $scope.registerUser = function() {
              user.register().save($scope.register)
              .$promise.then(onRegisterSuccess, onRegisterError);
          }
          
          
          $scope.logout = function() {
            auth.logout && auth.logout()
          }
          
          $scope.isAuthed = function() {
            return auth.isAuthed ? auth.isAuthed() : false
          }
          
          $scope.reset = function() {
              
              $scope.newPassError = false;
              
              if ($scope.newPassword != $scope.confirmPassword){
                  $scope.newPassError = true;
                  $scope.username = "";
                  $scope.password = "";
                  $scope.newPassword = "";
                  $scope.confirmPassword = "";
                  return;
              }
              user.reset().save({username:    $scope.username, 
                                 password:    $scope.password, 
                                 newPassword: $scope.newPassword})
              .$promise.then(onResetSuccess, onResetError);
          }

          $scope.removeUser = function() {
              
              user.users().delete({username: $scope.username})
                  .$promise.then(onSuccess, onError);
          }

          
        }])
        // End User Management Controller

        .controller('LinkUserController', ['$scope', '$state', 'auth', 'user', 'transformerFactory',
          function ($scope, $state, auth, user,transformerFactory) {

              if(!auth.isAuthed()){
                  $state.go('app.login');
              }      

              var userAdmin = auth.getTokenUser();
              
              if(!userAdmin.admin){
                  $state.go('app.home');   
              }

              $scope.transformerId = "";
              var trans = null;
              trans = transformerFactory.getTransformer();

              if (trans != null){      
                $scope.transformerId = trans.transformerId;
              }

              $scope.linkSuccess = false;
              $scope.linkError = false;
              $scope.alreadyLinked = false;

              function onLinkSuccess(res) {
                  $scope.linkSuccess = true;
                  $scope.username = "";
                  $scope.transformerId = "";
              }

              function onLinkError(res) {
                  
                      if (res.status == 405)
                          $scope.alreadyLinked = true;
                      else
                        $scope.linkError = true;
                  
                      $scope.linkSuccess = false;
              }
              
              $scope.linkUser = function() {
                  user.link().update({username: $scope.username, 
                             transformerId: $scope.transformerId})
                  .$promise.then(onLinkSuccess, onLinkError);
              }
              
          }])


        .controller('UnlinkUserController', ['$scope', '$state', 'auth', 'user', 'transformerFactory',
          function ($scope, $state, auth, user,transformerFactory) {

              if(!auth.isAuthed()){
                  $state.go('app.login');
              }      

              var userAdmin = auth.getTokenUser();
              
              if(!userAdmin.admin){
                  $state.go('app.home');   
              }

              $scope.transformerId = "";
              var trans = null;
              trans = transformerFactory.getTransformer();

              if (trans != null){      
                $scope.transformerId = trans.transformerId;
              }

              $scope.unlinkSuccess = false;
              $scope.unlinkError = false;
              $scope.notLinked = false;

              function onUnlinkSuccess(res) {
                  $scope.unlinkSuccess = true;
                  $scope.username = "";
                  $scope.transformerId = "";
              }

              function onUnlinkError(res) {
                  
                      if (res.status == 404)
                          $scope.notLinked = true;
                      else
                        $scope.unlinkError = true;
                  
                      $scope.unlinkSuccess = false;
              }
              
              $scope.unlinkUser = function() {
                  user.unlink().update({username: $scope.username, 
                             transformerId: $scope.transformerId})
                  .$promise.then(onUnlinkSuccess, onUnlinkError);
              }
              
          }])

        .controller('AddTransformerController', ['$scope', '$state', 'auth', 'transformerFactory', 
                                                 '$window',
          function ($scope, $state, auth, transformerFactory, $window) {

              if(!auth.isAuthed()){
                  $state.go('app.login');
              }      

              var user = auth.getTokenUser();
              
              if(!user.admin){
                  $state.go('app.home');   
              }
              
              $scope.register= {transformerId:"", company:""};

              var trans = null;
              trans = transformerFactory.getTransformer();
              
              if (trans != null){      
                $scope.register.transformerId = trans.transformerId;
                $scope.register.company =  trans.company;
              }
              
              $scope.registerSuccess = false;
              $scope.registerError = false;

              function onRegisterSuccess(res) {
                  $window.scrollTo(0, 0);
                  $scope.registerSuccess = true;
                  $scope.registerError = false;
                  console.log(res);
                  $scope.controllerToken = res.controllerToken;
                  $scope.register = 
                      {transformerId:"", company:"", location:"", type:"", subType:"",
                      voltageRating:0, currentRating:0, overVoltageThreshold:0,
                      underVoltageThreshold:0, overLoadThreshold:0, underLoadThreshold:0,
                      oilTemperatureThreshold:0, windingTemperatureThreshold:0, 
                      surfaceTemperatureThreshold:0, description:""};
                  $scope.registerForm.$setPristine();
              }

              function onRegisterError(res) {
                      $window.scrollTo(0, 0);
                      $scope.registerError = true;
                      $scope.registerSuccess = false;
              }
              
              $scope.registerTransformer = function() {
                  transformerFactory.transformers().save($scope.register)
                  .$promise.then(onRegisterSuccess, onRegisterError);
              }
              
          }])

        .controller('RemoveTransformerController', ['$scope', '$state', 'auth', 'transformerFactory', 
                                                 '$window',
          function ($scope, $state, auth, transformerFactory, $window) {

              if(!auth.isAuthed()){
                  $state.go('app.login');
              }      

              var user = auth.getTokenUser();
              
              if(!user.admin){
                  $state.go('app.home');   
              }
              
              var trans = null;
              trans = transformerFactory.getTransformer();
              
              if (trans != null){      
                $scope.transformerId = trans.transformerId;
              }
              
              $scope.successuccess = false;
              $scope.error = false;

              function onSuccess(res) {
                  $window.scrollTo(0, 0);
                  $scope.success = true;
                  $scope.error = false;
              }

              function onError(res) {
                      $window.scrollTo(0, 0);
                      $scope.error = true;
                      $scope.success = false;
                      console.log(res);
              }
              
              $scope.removeTransformer = function() {
                  transformerFactory.transformers().delete({transformerId: $scope.transformerId})
                  .$promise.then(onSuccess, onError);
              }
              
          }])


        .controller('MenuController', ['$scope', 'menuFactory',
          function($scope, menuFactory) {

            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;

            $scope.showMenu = false;
            $scope.message = "Loading ...";

            $scope.dishes = menuFactory.getDishes().query(
              function(response) {
                  $scope.dishes = response;
                  $scope.showMenu = true;
              },
              function(response) {
                  $scope.message = "Error: "+response.status + " " + response.statusText;
              }
            );

            $scope.select = function(setTab) {
                $scope.tab = setTab;

                if (setTab === 2) {
                    $scope.filtText = "appetizer";
                }
                else if (setTab === 3) {
                    $scope.filtText = "mains";
                }
                else if (setTab === 4) {
                    $scope.filtText = "dessert";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };

            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };
        }])

        .controller('ContactController', ['$scope', 'feedbackFactory',
          function($scope, feedbackFactory) {

            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };

            var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];

            $scope.channels = channels;
            $scope.invalidChannelSelection = false;

        }])

        .controller('FeedbackController', ['$scope', 'feedbackFactory',
          function($scope, feedbackFactory) {


            $scope.sendFeedback = function() {

                console.log($scope.feedback);

                if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
                    $scope.invalidChannelSelection = true;
                    console.log('incorrect');
                }
                else {
                    $scope.invalidChannelSelection = false;
                    feedbackFactory.getFeedback().save($scope.feedback);
                    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
                    $scope.feedback.mychannel="";
                    $scope.feedbackForm.$setPristine();
                    console.log($scope.feedback);
                }
            };
        }])

        .controller('DishDetailController', ['$scope', '$stateParams', 'menuFactory',
          function($scope, $stateParams, menuFactory) {

          $scope.showDish = false;
          $scope.message="Loading ...";

          $scope.dish = menuFactory.getDishes().get({id:parseInt($stateParams.id,10)})
          .$promise.then(
                    function(response){
                            $scope.dish = response;
                            $scope.showDish = true;
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    }
          );

        }])

        .controller('DishCommentController', ['$scope', 'menuFactory',
            function($scope, menuFactory) {

            $scope.comments = {rating:5, comment:"", author:"", date:""};

            $scope.submitComment = function () {

                $scope.comments.date = new Date().toISOString();
                console.log($scope.comments);

                $scope.dish.comments.push($scope.comments);

                menuFactory.getDishes().update({id:$scope.dish.id}, $scope.dish);

                $scope.commentForm.$setPristine();

                $scope.comments = {rating:5, comment:"", author:"", date:""};
            }
        }])

        // implement the IndexController and About Controller here
        .controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory',
          function($scope, menuFactory, corporateFactory) {

            $scope.showDish = false;
            $scope.message="Loading ...";

            $scope.featuredDish = menuFactory.getDishes().get({id:0})
            .$promise.then(
                      function(response){
                              $scope.featuredDish = response;
                              $scope.showDish = true;
                      },
                      function(response) {
                          $scope.message = "Error: "+response.status + " " + response.statusText;
                      }
            );


            $scope.promotion = menuFactory.getPromotion().get({id:0})
            .$promise.then(
                      function(response){
                              $scope.promotion = response;
                      },
                      function(response) {
                          $scope.message = "Error: "+response.status + " " + response.statusText;
                      }
            );




            $scope.chef = corporateFactory.getLeader().get({id:0})
            .$promise.then(
                      function(response){
                              $scope.chef = response;
                      },
                      function(response) {
                          $scope.message = "Error: "+response.status + " " + response.statusText;
                      }
            );

        }])

        .controller('AboutController', ['$scope', 'corporateFactory',
          function($scope, corporateFactory) {

          $scope.leaders= corporateFactory.getLeader().query(
            function(response) {
                $scope.leaders = response;
                $scope.showMenu = true;
            },
            function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            }
          );


        }])

;
