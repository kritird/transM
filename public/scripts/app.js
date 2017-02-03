'use strict';

angular.module('transMApp', ['ui.router', 'ngResource', 'nvd3'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider

            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                    },
                    'content@': {
                        templateUrl : 'views/home.html'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })

            // Main Page After Login
            .state('app.main', {
                url:'main',
                views: {
                    'content@': {
                        templateUrl : 'views/main.html',
                        controller  : 'MainController'
                    }
                }

            })
        
            // Dashboard
            .state('app.dashboard', {
                url:'dashboard/:transformerId',
                views: {
                    'content@': {
                        templateUrl : 'views/dashboard.html',
                        controller  : 'DashboardController'
                    }
                }

            })

        
            // route for the aboutus page
            .state('app.aboutus', {
                url:'aboutus',
                views: {
                    'content@': {
                        templateUrl : 'views/aboutus.html',
                        controller  : 'AboutController'
                    }
                }
            })

            // route for the login page
            .state('app.login', {
                url:'login',
                views: {
                    'content@': {
                        templateUrl : 'views/login.html',
                        controller  : 'UserController'
                    }
                }
            })
        
            // route for the admin register page
            .state('app.register', {
                url:'register/admin/010265/secret',
                views: {
                    'content@': {
                        templateUrl : 'views/register.html',
                        controller  : 'UserController'
                    }
                }
            })

            // route for the add user page
            .state('app.adduser', {
                url:'addUser',
                views: {
                    'content@': {
                        templateUrl : 'views/adduser.html',
                        controller  : 'AddUserController'
                    }
                }
            })

            // route for the add transformer page
            .state('app.addtransformer', {
                url:'addtransformer',
                views: {
                    'content@': {
                        templateUrl : 'views/addtransformer.html',
                        controller  : 'AddTransformerController'
                    }
                }
            })

            // route for the add transformer page
            .state('app.linkuser', {
                url:'linkuser',
                views: {
                    'content@': {
                        templateUrl : 'views/linkuser.html',
                        controller  : 'LinkUserController'
                    }
                }
            })

            .state('app.unlinkuser', {
                url:'unlinkuser',
                views: {
                    'content@': {
                        templateUrl : 'views/unlinkuser.html',
                        controller  : 'UnlinkUserController'
                    }
                }
            })

            .state('app.removetransformer', {
                url:'removetransformer',
                views: {
                    'content@': {
                        templateUrl : 'views/removetransformer.html',
                        controller  : 'RemoveTransformerController'
                    }
                }
            })

            .state('app.reset', {
                url:'resetPassword',
                views: {
                    'content@': {
                        templateUrl : 'views/reset.html',
                        controller  : 'UserController'
                    }
                }
            })

            .state('app.removeuser', {
                url:'removeuser',
                views: {
                    'content@': {
                        templateUrl : 'views/removeuser.html',
                        controller  : 'UserController'
                    }
                }
            })

            // route for the contactus page
            .state('app.contactus', {
                url:'contactus',
                views: {
                    'content@': {
                        templateUrl : 'views/contactus.html',
                        controller  : 'ContactController'
                    }
                }
            })

            // route for the menu page
            .state('app.menu', {
                url: 'menu',
                views: {
                    'content@': {
                        templateUrl : 'views/menu.html',
                        controller  : 'MenuController'
                    }
                }
            })

            // route for the dishdetail page
            .state('app.dishdetails', {
                url: 'menu/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/dishdetail.html',
                        controller  : 'DishDetailController'
                   }
                }
            });

        $urlRouterProvider.otherwise('/');
    })
;
