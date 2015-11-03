'use strict';

export default function(app) {
    app.config(['$translateProvider', ($translateProvider) => {
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('sanitize');
        $translateProvider.useLoader('TranslationLoader');
    }]);

    app.config(['$httpProvider', ($httpProvider) => {
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.interceptors.push([
            '$injector', ($injector) => $injector.get('AuthInterceptor')
        ]);
    }]);

    app.config(['$logProvider', ($logProvider) =>{
        $logProvider.debugEnabled(true);
    }]);
}

