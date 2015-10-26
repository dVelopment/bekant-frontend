'use strict';

import 'angular-translate-loader-static-files';

export default function(app) {
    app.config(['$translateProvider', ($translateProvider) => {
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('sanitize');
        $translateProvider.useLoader('TranslationLoader');
        //$translateProvider.useStaticFilesLoader({
        //    prefix: '/i18n/locale-',
        //    suffix: '.json'
        //});
    }]);

    app.config(['$httpProvider', ($httpProvider) => {
        $httpProvider.defaults.withCredentials = true;
    }]);
}

