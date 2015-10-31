'use strict';

const URL = Symbol();

class Api {
    constructor($log, $http, Settings, $q, $rootScope, APP_EVENTS, $interval) {
        this.$log = $log;
        this.$http = $http;
        this.settings = Settings;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.APP_EVENTS = APP_EVENTS;
        this.$interval = $interval;

        $rootScope.$on(APP_EVENTS.unconfigured, () => {
            this.clearUrl();
        });

        this.def = null;
    }

    isConfigured() {
        return !!this[URL];
    }

    requireApiUrl() {
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

                    // ck url
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

    clearUrl() {
        if (this[URL]) {
            if (this.url === this.settings.get('apiUrl')) {
                this.settings.remove('apiUrl');
            }

            delete this[URL];
        }
        this.def = null;
        this.clearInterval();
    }

    setInterval() {
        this.clearInterval();
        this.interval = this.$interval(this.ping.bind(this), 10000);
    }

    clearInterval() {
        if (this.interval) {
            this.$interval.cancel(this.interval);
            this.interval = null;
        }
    }

    ping() {
        if (!this[URL]) {
            return this.clearInterval();
        }

        this.$http.post(this.url + '/ping')
            .then((response) => {
                if (!response.data || response.data !== 'pong') {
                    this.clearUrl();
                }
            });
    }

    checkUrl(url) {
        return this.$http.post(url + '/ping')
            .then((response) => {
                if (response.data && response.data === 'pong') {
                    this.settings.set('apiUrl', url);
                    this[URL] = url;
                    this.$rootScope.$broadcast(this.APP_EVENTS.configured, url);

                    this.setInterval();

                    return url;
                } else {
                    return Promise.reject();
                }
            });
    }
}

export default [
    '$log', '$http', 'Settings', '$q', '$rootScope', 'APP_EVENTS', '$interval',
    ($log, $http, Settings, $q, $rootScope, APP_EVENTS, $interval) => {
        return new Api($log, $http, Settings, $q, $rootScope, APP_EVENTS, $interval);
    }
];
