'use strict';

import localforage from 'localforage';
import _ from 'lodash';

const STORAGE = Symbol();
const STORAGE_KEY = '_settings';
const DATA = Symbol();

class Settings {
    constructor($log, $q, $rootScope, APP_EVENTS) {
        this[STORAGE] = localforage;
        this.def = $q.defer();
        this.$log = $log;
        this.$rootScope = $rootScope;
        this.APP_EVENTS = APP_EVENTS;

        this.initialize();
    }

    get storage() {
        return this[STORAGE];
    }

    initialize() {
        this.restoreState();
        this.$rootScope.$on(this.APP_EVENTS.beforeUnload, this.onBeforeUnload.bind(this));
    }

    saveState() {
        let data = _.extend({}, this[DATA]);
        this.$log.debug('[Settings] save state', data, STORAGE_KEY);
        this.storage.setItem(STORAGE_KEY, data).then(() => {
            this.$log.debug('[Settings] state saved successfully');
        }, (err) => {
            this.$log.warn('[Settings] error saving state', err);
        });
    }

    restoreState() {
        this.storage.getItem(STORAGE_KEY).then((data) => {
            this.$log.debug('[Settings] restoreState', data);

            if (data) {
                this[DATA] = data;
            } else {
                this[DATA] = {};
            }

            this.def.resolve();
        }, () => {
            this.def.resolve();
        });
    }

    onBeforeUnload() {
        this.$log.debug('[Settings] onBeforeUnload');
        this.saveState();
    }

    ready() {
        console.debug('[Settings] ready', arguments);
        return this.def.promise;
    }

    get(key) {
        return this[DATA][key] ? this[DATA][key] : null;
    }

    set(key, value, andSave = true) {
        this[DATA][key] = value;

        if (andSave) {
            this.saveState();
        }

        return this;
    }

    remove(key, andSave = true) {
        if (this[DATA][key]) {
            delete this[DATA][key];

            if (andSave) {
                this.saveState();
            }
        }

        return this;
    }
}

export default [
    '$log',
    '$q',
    '$rootScope',
    'APP_EVENTS',
    ($log, $q, $rootScope, APP_EVENTS) => new Settings($log, $q, $rootScope, APP_EVENTS)
];
