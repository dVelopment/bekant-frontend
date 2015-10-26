'use strict';

const URL = Symbol();

class Api {
    constructor($http, Settings, $q, $rootScope, APP_EVENTS) {
        this.$http = $http;
        this.settings = Settings;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.APP_EVENTS = APP_EVENTS;

        this.def = null;
    }

    isConfigured() {
        return !!this[URL];
    }

    requireApiUrl() {
        console.debug('[Api] requireApiUrl', this.def);
        if (!this.def) {
            this.def = this.$q.defer();

            if (this[URL]) {
                this.def.resolve(this[URL]);
            } else {
                this.settings.ready().then(() => {
                    let url = this.settings.get('apiUrl');

                    if (!url) {
                        this.def.reject('NO_API_URL');
                        this.def = null;
                        return;
                    }

                    // check url
                    this.checkUrl(url).then(() => {
                        this.def.resolve(url);
                    }, (err) => {
                        this.settings.remove('apiUrl');
                        this.def.reject(err);
                        this.def = null;
                    });
                });
            }
        }

        return this.def.promise;
    }

    get url() {
        if (!this[URL]) {
            throw new Error('no API URL set yet');
        }

        return this[URL];
    }

    checkUrl(url) {
        return this.$http.get(url + '/auth/loggedin')
            .then((response) => {
                this.settings.set('apiUrl', url);
                this[URL] = url;
                this.$rootScope.$broadcast(this.APP_EVENTS.configured, url);

                return response.data;
            });
    }
}

export default [
    '$http', 'Settings', '$q', '$rootScope', 'APP_EVENTS',
    ($http, Settings, $q, $rootScope, APP_EVENTS) => {
        return new Api($http, Settings, $q, $rootScope, APP_EVENTS);
    }
];
