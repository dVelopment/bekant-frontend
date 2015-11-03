'use strict';

import _ from 'lodash';

export default class MainController {
    constructor($log, Settings, $state, $scope, $ionicSideMenuDelegate, Api, $rootScope, APP_EVENTS, $ionicModal, Auth, Bonjour) {
        this.$log = $log;
        this.settings = Settings;
        this.$state = $state;
        this.$scope = $scope;
        this.api = Api;
        this.$sideMenu = $ionicSideMenuDelegate;
        this.$rootScope = $rootScope;
        this.APP_EVENTS = APP_EVENTS;
        this.$modal = $ionicModal;
        this.auth = Auth;
        this.bonjour = Bonjour;

        $scope.initModel = {};

        $scope.services = () => Bonjour.services;

        $scope.onServiceSelected = this.onServiceSelected.bind(this);

        this.settings.ready().then(() => {
            let url = this.settings.get('apiUrl');
            $scope.initModel.host = url;
            if (url) {
                this.onHostChanged(url.replace(/^https?:\/\//, ''));
            }
        });

        this.$scope.loginModel = {};
        this.$scope.signupModel = {};

        let watchers = [];
        watchers.push($scope.$on('$destroy'), () => {
            _.forEach(watchers, (w) => w());
        });

        watchers.push($scope.$watch('services()', (services, oldServices) => {
            $log.debug('[MainCtrl] services()', services, oldServices);
            if (services && services.length && (!oldServices || services.length !== oldServices.length)) {
                this.onServiceAdded();
            }
        }, true));

        $scope.submit = this.submit.bind(this);
        $scope.configured = this.isConfigured.bind(this);
        $scope.loggedIn = this.isLoggedIn.bind(this);
        $scope.openLogin = this.openLogin.bind(this);
        $scope.openSignup = this.openSignup.bind(this);
        $scope.login = this.login.bind(this);
        $scope.signup = this.signup.bind(this);
    }

    isConfigured() {
        return this.api.isConfigured();
    }

    isLoggedIn() {
        return this.auth.isLoggedIn();
    }

    openLogin(event) {
        event.preventDefault();
        event.stopPropagation();

        this.openModal('modals/login.html');
    }

    openSignup(event) {
        event.preventDefault();
        event.stopPropagation();

        this.openModal('modals/signup.html');
    }

    openModal(templateUrl) {
        let onHidden, hiddenListener;
        onHidden = () => {
            hiddenListener();
            this.modal.remove();
        };

        this.$modal.fromTemplateUrl(templateUrl, {
            scope: this.$scope,
            animation: 'slide-in-up'
        }).then((modal) => {
            this.modal = modal;
            modal.show();
        });

        hiddenListener = this.$scope.$on('modal.hidden', onHidden);
    }

    closeModal() {
        if (this.modal) {
            this.modal.hide();
        }
    }

    login() {
        this.$scope.loggingIn = true;

        this.auth.login('local', this.$scope.loginModel)
            .then(() => {
                this.$scope.loggingIn = false;
                this.closeModal();
                this.$state.go('tab.steer');
                this.closeSideMenu();
            }, (err) => {
                this.$scope.loggingIn = false;
                this.$log.warn('[MainCtrl] error logging in', err);
            });
    }

    signup() {
        this.$scope.signingUp = true;
        this.auth.signup('local', this.$scope.signupModel)
            .then((user) => {
                this.$scope.signingUp = false;
                this.closeModal();
                this.$state.go('tab.steer');
                this.closeSideMenu();
            }, (err) => {
                this.$scope.signingUp = false;
                this.$log.warn('error signing up', err);
            });
    }

    submit() {
        this.$scope.submitting = true;
        let url = this.$scope.initModel.host;
        this.$scope.showError = false;

        if (!/^https?:\/\//.test(url)) {
            url = 'http://' + url;
        }

        this.api.checkUrl(url).then(() => {
            // url valid
            this.$scope.submitting = false;
            this.settings.set('apiUrl', url);

            // already logged in?
            this.auth.checkState().then(() => {
                if (this.auth.isLoggedIn()) {
                    this.$state.go('tab.steer');
                    this.closeSideMenu();
                } else {
                    this.$state.go('login');
                }
            });
        }, () => {
            this.$scope.showError = true;
            this.$scope.submitting = false;
        });
    }

    closeSideMenu() {
        let $menu = this.$sideMenu.$getByHandle('mainMenu');
        if ($menu.isOpenLeft() === true) {
            $menu.toggleLeft(false);
        }
    }

    onServiceAdded() {
        if (this.$scope.initModel.service || !this.$scope.initModel.host) {
            return;
        }

        this.onHostChanged(this.$scope.initModel.host);
    }

    onServiceSelected(service) {
        this.$log.debug('[MainCtrl] onServiceSelected', service);
        if (service && service.host) {
            this.$scope.initModel.host = `${service.host}:${service.port}`;
        }
    }

    onHostChanged(host) {
        if (!host) {
            return;
        }
        this.bonjour.ready().then(() => {
            let search = host.replace(/https?:\/\//, '');
            let service = _.find(this.bonjour.services, (service) => {
                return `${service.host}:${service.port}` === search;
            });

            this.$scope.initModel.service = service;
        });
    }

    static get $inject() {
        return ['$log', 'Settings', '$state', '$scope', '$ionicSideMenuDelegate', 'Api', '$rootScope', 'APP_EVENTS', '$ionicModal', 'Auth', 'Bonjour'];
    }
}
