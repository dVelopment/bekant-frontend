'use strict';

import _ from 'lodash';
import localforage from 'localforage';

const STORAGE_KEY = '_credentials';
const SERVICE_NAME = 'Bekant';

class LocalStorageStore {
    constructor($log) {
        this.$log = $log;
    }

    get(key) {
        return localforage.getItem(STORAGE_KEY).then((data) => {
            if (data && data[key]) {
                return data[key];
            } else {
                return null;
            }
        });
    }

    set (key, value) {
        return localforage.getItem(STORAGE_KEY).then((data) => {
            this.$log.debug('[LocalStorageStore] loaded', data);
            if (!data) {
                data = {};
            }

            data[key] = value;

            return localforage.setItem(STORAGE_KEY, data).then(() => value);
        }, (err) => {
            this.$log.warn('[LocalStorageStore] err', err);

            return Promise.reject();
        });
    }

    remove(key) {
        return localforage.getItem(STORAGE_KEY).then((data) => {
            if (data && data[key]) {
                delete data[key];

                return localforage.setItem(STORAGE_KEY, data);
            } else {
                return null;
            }
        });
    }
}

class KeychainStore {
    constructor($log, $keychain) {
        this.$log = $log;
        this.$keychain = $keychain;
    }

    static stringify(value) {
        return JSON.stringify(value)
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    }

    static parse(value) {
        return JSON.parse(
            value
                .replace(/\\\\/g, '\\')
                .replace(/\\\"/g, '"')
                .replace(/\//g, '/')
                .replace(/\\b/g, '\b')
                .replace(/\\f/g, '\f')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t')
        );
    }

    get(key) {
        return this.$keychain.getForKey(key, SERVICE_NAME)
            .then((value) => {
                if (value && value !== '') {
                    this.$log.info('[KeychainStore] get', key, KeychainStore.parse(value));
                    return KeychainStore.parse(value);
                } else {
                    return null;
                }
            }, (err) => {
                this.$log.error('[KeychainStore] error getting value', err);
                return null;
            });
    }

    set(key, value) {
        return this.$keychain.setForKey(key, SERVICE_NAME, KeychainStore.stringify(value));
    }

    remove(key) {
        return this.$keychain.removeForKey(key, SERVICE_NAME);
    }
}

class CredentialsStore {
    constructor($log, $injector, $ionicPlatform) {
        this.promise = new Promise((resolve) => {
            $ionicPlatform.ready().then(() => {
                if (ionic.Platform.isIOS() && ('undefined' !== typeof Keychain)) {
                    this.store = new KeychainStore($log, $injector.get('$cordovaKeychain'));
                } else {
                    this.store = new LocalStorageStore($log);
                }

                resolve();
            });
        });
    }

    get(key) {
        return this.store.get(key);
    }

    set(key, value) {
        return this.store.set(key, value);
    }

    remove(key) {
        return this.store.remove(key);
    }

    ready() {
        return this.promise;
    }
}

export default [
    '$log', '$injector', '$ionicPlatform',
    ($log, $injector, $ionicPlatform) => new CredentialsStore($log, $injector, $ionicPlatform)]
