'use strict';

const USER = Symbol();
const LOGGED_IN = Symbol();
const API_KEY = Symbol();

const API_KEY_HEADER = 'X-Api-Key';

class Auth {
    constructor($log, $location, $rootScope, $http, Api, APP_EVENTS, $state, Credentials) {
        this.$log = $log;
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.$http = $http;
        this.api = Api;
        this.APP_EVENTS = APP_EVENTS;
        this.$state = $state;
        this.credentials = Credentials;

        this.api.requireApiUrl().then(this.onApiUrlLoaded.bind(this));
        this.$rootScope.$on(APP_EVENTS.configured, this.onApiUrlLoaded.bind(this));

        this[LOGGED_IN] = false;
        this[USER] = null;
    }

    get loggedIn() {
        return this[LOGGED_IN];
    }

    get apiKey() {
        return this[API_KEY] || null;
    }

    onApiUrlLoaded() {
        this[LOGGED_IN] = false;
        this.checkState().then((loggedIn) => {
            if (!loggedIn) {
                this.$state.reload();
            }
        }, () => {
            this.$state.reload();
        });
    }

    saveApiKey(data) {
        return new Promise((resolve) => {
            this.$log.debug('[Auth] saveApiKey', data);
            if (data && data.apiKey) {
                this.credentials.ready().then(() => {
                    this.credentials.set('apiKey', data.apiKey)
                        .then((tmp) => {
                            this.$log.debug('[Auth] apiKey stored', tmp);

                            resolve();
                        });
                });
            } else {
                resolve();
            }
        });
    }

    login(provider, data) {
        return new Promise((resolve, reject) => {
            this.api.requireApiUrl().then((url) => {
                this.$http.post(`${url}/auth/${provider}/login`, data)
                    .then((response) => {
                        let data = response.data;
                        this[LOGGED_IN] = !!data;
                        this[USER] = data;
                        resolve(data);
                        this.$log.debug('[Auth] logged in', data);
                        this.saveApiKey(data);
                    }, (err) => {
                        reject(err);
                    });
            });
        });
    }

    signup(provider, data) {
        this.$log.debug('[Auth] signup', provider, data);
        return new Promise((resolve, reject) => {
            this.api.requireApiUrl().then((url) => {
                this.$http.post(`${url}/auth/${provider}/signup`, data)
                    .then((response) => {
                        let data = response.data;
                        this[LOGGED_IN] = data && !!data.user;
                        this[USER] = data.user;

                        this.$log.debug('[Auth] signed up', data);
                        resolve(data.user);
                        this.saveApiKey(data);
                    }, (err) => {
                        reject(err);
                    });
            });
        });
    }

    checkState() {
        if (!this.checking) {
            this.checking = this.credentials.ready().then(() => {
                return this.credentials.get('apiKey')
                    .then((apiKey) => {
                        this.checking = null;
                        this.$log.debug('[Auth] get api key', apiKey);
                        if (apiKey && apiKey.apiKey) {
                            return this.checkApiKey(apiKey.apiKey);
                        }

                        return false;
                    }, (err) => {
                        this.checking = null;
                        this.$log.warn('[Auth] error retrieving api key', err);
                        return false;
                    });
            });
        }

        return this.checking;
    }

    checkApiKey(apiKey) {
        this.$log.debug('[Auth] check api key', apiKey);
        return this.api.requireApiUrl().then((url) => {
            let headers = {};
            headers[API_KEY_HEADER] = apiKey;
            return this.$http.post(`${url}/auth/api_key/extend`, {}, {
                headers: headers
            }).then((response) => {
                let data = response.data;
                this.$log.debug('[Auth] successfully checked API key', data);
                this.saveApiKey({apiKey: data});

                return true;
            }, (err) => {
                this.$log.warn('[Auth] invalid api key', err);

                this.credentials.remove('apiKey');

                return Promise.reject();
            });
        });
    }

    isLoggedIn() {
        //this.$log.debug('[Auth] isLoggedIn', this.loggedIn);
        return this.loggedIn;
    }

    requireUser() {
        return new Promise((resolve, reject) => {
            if (this.isLoggedIn()) {
                return resolve(this.user);
            }

            this.checkState().then((loggedIn) => {
                this.$log.info('[Auth] state checked', loggedIn);
                if (loggedIn) {
                    resolve(this.user);
                } else {
                    reject('AUTH_REQUIRED');
                }
            });
        });
    }

    get user() {
        return this[USER];
    }
}

export default {
    factory: [
        '$log', '$location', '$rootScope', '$http', 'Api', 'APP_EVENTS', '$state', 'Credentials',
        ($log, $l, $r, $ht, Api, AE, $s, Credentials) => new Auth($log, $l, $r, $ht, Api, AE, $s, Credentials)
    ],
    interceptor: [
        '$log', '$rootScope', 'APP_EVENTS', '$q',
        ($log, $rootScope, APP_EVENTS, $q) => {
            return {
                request: (config) => {
                    if ($rootScope.apiKey) {
                        config.headers[API_KEY_HEADER] = $rootScope.apiKey;
                    }

                    return config;
                }
            };
        }
    ]
};
