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
        distanceRead: 'app-distance-read',
        deskStatus: 'app-desk-status',
        deskPrimed: 'app-desk-is-primed'
    });

    app.run(['$rootScope', 'APP_EVENTS', '$ionicPlatform', '$state', ($rootScope, APP_EVENTS, $ionicPlatform, $state) => {
        _.forEach(APP_EVENTS, (key, value) => {
            $ionicPlatform.on(key, () => {
                $rootScope.$broadcast(value);
            });
        });

        angular.element(window).on('beforeunload', () => {
            $rootScope.$broadcast(APP_EVENTS.beforeUnload);
        });

        $rootScope.$on(APP_EVENTS.distanceRead, (event, distance) => {
            $rootScope.currentPosition = distance;
            console.info('[events] current position', distance);
        });

        $rootScope.$on(APP_EVENTS.deskStatus, (event, isPrimed) => {
            if (!isPrimed) {
                $state.go('prime');
            }
        });

        $rootScope.$on(APP_EVENTS.deskPrimed, (event) => {
            $state.go('tab.steer');
        });
    }]);
}

export default init;
