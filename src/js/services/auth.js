'use strict';

const USER = Symbol();
const LOGGED_IN = Symbol();

class Auth {
    constructor($location, $rootScope, $http, Api, APP_EVENTS, $state) {
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.$http = $http;
        this.api = Api;
        this.APP_EVENTS = APP_EVENTS;
        this.$state = $state;

        this.api.requireApiUrl().then(this.onApiUrlLoaded.bind(this));
        this.$rootScope.$on(APP_EVENTS.configured, this.onApiUrlLoaded.bind(this));

        this[LOGGED_IN] = false;
        this[USER] = null;
    }

    get loggedIn() {
        return this[LOGGED_IN];
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

    login(provider, data) {
        return new Promise((resolve, reject) => {
            this.api.requireApiUrl().then((url) => {
                this.$http.post(`${url}/auth/${provider}/login`, data)
                    .then((user) => {
                        this[LOGGED_IN] = !!user;
                        this[USER] = user;
                        resolve(user);
                    }, (err) => {
                        reject(err);
                    });
            });
        });
    }

    signup(provider, data) {
        return new Promise((resolve, reject) => {
            this.api.requireApiUrl().then((url) => {
                this.$http.post(`${url}/auth/${provider}/signup`, data)
                    .then((user) => {
                        this[LOGGED_IN] = !!user;
                        this[USER] = user;
                        resolve(user);
                    }, (err) => {
                        reject(err);
                    });
            });
        });
    }

    checkState() {
        return new Promise((resolve, reject) => {
            this.api.requireApiUrl().then((url) => {
                this.$http.get(url + '/auth/loggedin')
                    .then((response) => {
                        let user = response.data;
                        this[LOGGED_IN] = !!user;

                        if (user) {
                            this[USER] = user;
                        }

                        resolve(response.data);
                    });
            }, reject);
        });
    }

    isLoggedIn() {
        return this.loggedIn;
    }

    requireUser() {
        return new Promise((resolve, reject) => {
            if (this.isLoggedIn()) {
                return resolve(this.user);
            }

            this.checkState().then((loggedIn) => {
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

export default [
    '$location', '$rootScope', '$http', 'Api', 'APP_EVENTS', '$state',
    ($l, $r, $ht, Api, AE, $s) => new Auth($l, $r, $ht, Api, AE, $s)
];
