'use strict';

import io from 'socket.io-client';
import _ from 'lodash';

class Socket {
    constructor($log, Api, $rootScope, APP_EVENTS) {
        this.$log = $log;
        this.api = Api;
        this.$rootScope = $rootScope;
        this.APP_EVENTS = APP_EVENTS;

        this.api.requireApiUrl().then(this.onApiUrl.bind(this));
        this.$rootScope.$on(APP_EVENTS.configured, (event, url) => {
            this.onApiUrl(url);
        });
        this.connected = false;
        this.socketUrl = null;
        this.listeners = {};
        this.readyListeners = [];
        this.resetDistance();
    }

    on(event, listener) {
        if (!this.listeners.hasOwnProperty(event)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    trigger(event, ...args) {
        if (this.listeners.hasOwnProperty(event)) {
            _.forEach(this.listeners[event], (listener) => {
                try {
                    listener.apply(null, args);
                } catch (err) {
                    this.$log.warn(`[Socket] error notifying ${event} listener`, err);
                }
            });
        }
    }

    calculateDistance() {
        if (!this.distanceReads) {
            return 0.0;
        }

        return this.distanceSum / this.distanceReads;
    }

    onDistance(distance) {
        distance = parseFloat(distance);
        this.distanceReads++;
        this.distanceSum += distance;
        let average = this.calculateDistance();
        this.$rootScope.$broadcast(this.APP_EVENTS.distanceRead, average);
        this.trigger('distance', average);
    }

    onMoving(direction) {
        this.$log.debug('[Socket] moving', direction);
        this.$rootScope.$broadcast(this.APP_EVENTS.moving, direction);
        this.trigger('moving', direction);
    }

    onStopped() {
        this.$log.debug('[Socket] stop');
        this.$rootScope.$broadcast(this.APP_EVENTS.stopped);
        this.resetDistance();
        this.trigger('stop');
    }

    resetDistance() {
        this.$log.debug('[Socket] reset distance');
        this.distanceReads = 0;
        this.distanceSum = 0.0;
    }

    move(direction) {
        this.$log.debug('[Socket] move', direction);
        this.socket.emit('move', direction);
    }

    stop() {
        this.socket.emit('stop');
    }

    go(id) {
        this.socket.emit('go', id);
    }

    onApiUrl(url) {
        this.$log.debug('[Socket] onApiUrl', url);
        if (url) {
            this.connect(url);
        }
    }

    connect(url) {
        if (this.connected && this.socketUrl !== url) {
            this.disconnect();
        }

        this.socket = io(url);
        this.socketUrl = url;

        this.promise = new Promise((resolve) => {
            this.socket.on('connect', () => {
                this.connected = true;
                this.$log.debug('[Socket] connection', _.values(arguments));
                this.socket.on('distance', this.onDistance.bind(this));
                this.socket.on('moving', this.onMoving.bind(this));
                this.socket.on('stopped', this.onStopped.bind(this));
                resolve();
                _.forEach(this.readyListeners, (l) => l());
            });
        });
    }

    ready() {
        if (this.promise) {
            return this.promise;
        } else {
            return new Promise((resolve) => {
                this.readyListeners.push(resolve);
            });
        }
    }

    disconnect() {
        delete this.socket;
        this.promise = null;
    }
}

export default [
    '$log', 'Api', '$rootScope', 'APP_EVENTS',
    ($log, Api, $rootScope, APP_EVENTS) => new Socket($log, Api, $rootScope, APP_EVENTS)
];
