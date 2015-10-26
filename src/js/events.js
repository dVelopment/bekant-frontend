'use strict';

import _ from 'lodash';

function init(app) {
    app.constant('APP_EVENTS', {
        pause: 'app-pause',
        resume: 'app-resume',
        offline: 'app-offline',
        online: 'app-online',
        beforeUnload: 'app-before-unload',
        configured: 'app-configured',
        distanceRead: 'app-distance-read'
    });

    app.run(['$rootScope', 'APP_EVENTS', '$ionicPlatform', ($rootScope, APP_EVENTS, $ionicPlatform) => {
        _.forEach(APP_EVENTS, (key, value) => {
            $ionicPlatform.on(key, () => {
                $rootScope.$broadcast(value);
            });
        });

        angular.element(window).on('beforeunload', () => {
            $rootScope.$broadcast(APP_EVENTS.beforeUnload);
        })
    }]);
}

export default init;
