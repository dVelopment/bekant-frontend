'use strict';

import Settings from './settings';
import Bonjour from './bonjour';
import Api from './api';
import Auth from './auth';
import Socket from './socket';
import Preferences from './preferences';

import 'angular-resource';

export default function (angular) {
    let app = angular.module('services', ['ngResource']);

    app.factory('Settings', Settings);
    app.factory('Bonjour', Bonjour);
    app.factory('Api', Api);
    app.factory('Auth', Auth);
    app.factory('Socket', Socket);
    app.factory('Preferences', Preferences);

    app.run(['Auth', 'APP_EVENTS', '$rootScope', (Auth, APP_EVENTS, $rootScope) => {
        Auth.checkState().then((loggedIn) => {

        });
    }]);

    app.factory('TranslationLoader', ['$log', '$http', '$q', '$ionicPlatform', ($log, $http, $q, $ionicPlatform) => {
        return (options) => {
            let deferred = $q.defer();

            let url = `/i18n/locale-${options.key}.json`;
            $ionicPlatform.ready().then(() => {
                if ('undefined' !== typeof cordova && cordova.file) {
                    url = cordova.file.applicationDirectory + 'www' + url;
                }

                $log.debug('[TranslationLoader] get translations for ', options, url);

                $http.get(url).then((response) => {
                    $log.debug('[TranslationLoader] translations loaded', options, response.data);
                    deferred.resolve(response.data);
                }, (err) => {
                    $log.warn('[TranslationLoader] error loading translations', options, err);
                    deferred.reject();
                });
            });

            return deferred.promise;
        }
    }]);
};
