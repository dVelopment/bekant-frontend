'use strict';

import preferences from './preferences';
import steer from './steer';
import main from './main';

export default function (angular) {
    let app = angular.module('controllers', []);

    app.controller('SteerCtrl', steer);
    app.controller('PreferencesCtrl', preferences);
    app.controller('MainCtrl', main);
};
