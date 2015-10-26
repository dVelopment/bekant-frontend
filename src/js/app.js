'use strict';
import 'babel/polyfill';

// external dependencies
import 'angular-sanitize';
import 'angular-dynamic-locale';
import 'angular-translate';
import 'angular-nl2br';

// moment
import moment from 'moment';
import 'moment/locale/de';

import config from './config';
import events from './events';

import controllers from './controllers';
import services from './services';
import directives from './directives';
controllers(angular);
services(angular);
directives(angular);

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
let app = angular.module('bekant', ['ionic', 'controllers', 'services', 'directives', 'ngSanitize', 'tmh.dynamicLocale', 'nl2br', 'pascalprecht.translate', 'ngCordova'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        let requireApiUrl = ['Api', (Api) => Api.requireApiUrl()];

        let requireUser = ['Auth', (Auth) => Auth.requireUser()];

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'partials/app.html',
                controller: 'MainCtrl'
            })

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                parent: 'app',
                views: {
                    menuContent: {
                        templateUrl: 'partials/tabs.html'
                    }
                },
                resolve: {
                    apiUrl: requireApiUrl,
                    currentUser: requireUser
                }
            })

            .state('init', {
                url: '/init',
                templateUrl: 'partials/init.html',
                controller: 'MainCtrl'
            })

            .state('login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                controller: 'MainCtrl',
                resolve: {
                    apiUrl: requireApiUrl
                }
            })

            .state('signup', {
                url: '/signup',
                templateUrl: 'partials/signup.html',
                controller: 'MainCtrl',
                resolve: {
                    apiUrl: requireApiUrl
                }
            })

            // Each tab has its own nav history stack:

            .state('tab.steer', {
                url: '/steer',
                views: {
                    'tab-steer': {
                        templateUrl: 'partials/tab-steer.html',
                        controller: 'SteerCtrl'
                    }
                }
            })

            .state('tab.preferences', {
                url: '/preferences',
                views: {
                    'tab-preferences': {
                        templateUrl: 'partials/tab-preferences.html',
                        controller: 'PreferencesCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/tab/steer');

    })
    .run(['$rootScope', '$state', ($rootScope, $state) => {
        $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
            console.warn('$stateChangeError', error);
            if (error === 'NO_API_URL') {
                $state.go('init');
            } else if (error === 'AUTH_REQUIRED') {
                $state.go('login');
            }
        });
    }]);

config(app);
events(app);
