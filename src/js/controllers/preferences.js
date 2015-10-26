'use strict';

import _ from 'lodash';

export default class PreferencesController {
    constructor($log, Socket, $scope, Preferences, $rootScope, APP_EVENTS, $ionicListDelegate) {
        this.$log = $log;
        this.$scope = $scope;
        this.preferences = Preferences;
        this.$rootScope = $rootScope;
        this.$scope.model = {};
        this.$list = $ionicListDelegate;
        this.$scope.showDelete = {
            value: false
        };
        this.socket = Socket;

        this.$rootScope.$on(APP_EVENTS.distanceRead, (event, distance) => {
            this.distance = distance;
        });

        this.$scope.adding = false;
        this.$scope.canSwipe = true;

        this.$scope.refresh = this.refresh.bind(this);
        this.$scope.toggleDelete = this.toggleDelete.bind(this);
        this.refresh();
        this.initialized = false;
    }

    refresh() {
        this.preferences.ready().then(() => {
            this.$scope.preferences = this.preferences.query();

            if (!this.initialized) {
                this.$scope.save = this.save.bind(this);
                this.$scope.remove = this.remove.bind(this);
                this.$scope.toggleAdding = this.toggleAdding.bind(this);
                this.$scope.edit = this.edit.bind(this);
                this.$scope.cancelEditing = this.cancelEditing.bind(this);
                this.$scope.update = this.update.bind(this);
                this.$scope.setToCurrentHeight = this.setToCurrentHeight.bind(this);
                this.$scope.go = this.go.bind(this);
                this.initialized = true;
            }
            this.$scope.$broadcast('scroll.refreshComplete');
        });
    }

    save() {
        this.$scope.saving = true;

        this.preferences.createPreference()
            .then((preference) => {
                this.$log.debug('[PreferencesCtrl] preference created', preference);
                preference = _.extend(preference, this.$scope.model);
                preference.position = this.$rootScope.currentPosition;

                this.$log.debug('[PreferencesCtrl] save new preference', preference);

                preference.$save().then((p) => {
                    this.$scope.saving = false;
                    this.$scope.adding = false;
                    this.$scope.preferences.push(p);
                }, () => {
                    this.$scope.saving = false;
                });
            });
    }

    remove(event, preference) {
        event.preventDefault();
        event.stopPropagation();

        this.$log.debug('remove', preference);

        let id = preference._id;

        preference.$remove().then(() => {
            _.remove(this.$scope.preferences, (p) => p._id === id);
        });
    }

    toggleAdding(event) {
        event.preventDefault();
        event.stopPropagation();

        this.$scope.adding = !this.$scope.adding;
    }

    edit(event, preference) {
        event.preventDefault();
        event.stopPropagation();

        preference._oldValues = _.extend({}, preference);

        this.$log.debug('edit', preference);
        preference._editing = true;
    }

    cancelEditing(event, preference) {
        event.preventDefault();
        event.stopPropagation();

        delete preference._editing;

        _.assign(preference, preference._oldValues);
        delete preference._oldValues;

        this.$list.closeOptionButtons();
    }

    setToCurrentHeight(event, preference) {
        event.preventDefault();
        event.stopPropagation();

        preference.position = this.$rootScope.currentPosition;

    }

    update(preference) {
        event.preventDefault();
        event.stopPropagation();

        delete preference._editing;
        delete preference._oldValues;
        this.$list.closeOptionButtons();
        preference.$update();
    }

    go(event, preference) {
        event.preventDefault();
        event.stopPropagation();

        this.$log.debug('[PreferencesCtrl] go', preference);

        this.socket.go(preference._id);
    }

    toggleDelete(event) {
        event.preventDefault();
        event.stopPropagation();

        this.$scope.showDelete.value = !this.$scope.showDelete.value;
    }

    static get $inject() {
        return ['$log', 'Socket', '$scope', 'Preferences', '$rootScope', 'APP_EVENTS', '$ionicListDelegate'];
    }
}
