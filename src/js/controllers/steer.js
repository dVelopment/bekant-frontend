'use strict';

export default class SteerController {
    constructor($log, Socket, $scope) {
        this.$log = $log;
        this.$scope = $scope;
        this.socket = Socket;

        this.$scope.getButtonClass = this.getButtonClass.bind(this);
        this.$scope.up = this.up.bind(this);
        this.$scope.down = this.down.bind(this);
        this.$scope.stop = this.stop.bind(this);
        this.moving = false;

        this.socket.on('distance', this.onDistance.bind(this));
        this.socket.on('moving', this.onMoving.bind(this));
        this.socket.on('stop', this.onStop.bind(this));
    }

    onDistance(distance) {
        this.$scope.$apply(() => {
            this.$scope.distance = distance;
        });
    }

    onMoving(direction) {
        this.$scope.$apply(() => {
            console.debug('[SteerCtrl] moving', direction);
            this.moving = direction;
        });
    }

    onStop() {
        this.$scope.$apply(() => {
            this.moving = false;
        });
    }

    getButtonClass(button) {
        if (this.moving) {
            return button === this.moving ? '' : 'button-outline';
        } else {
            return button === 'stop' ? '': 'button-outline';
        }
    }

    up(event) {
        event.preventDefault();
        event.stopPropagation();
        this.$log.debug('up', event);
        this.socket.ready().then(() => {
            this.socket.move('up');
        });
    }

    down(event) {
        event.preventDefault();
        event.stopPropagation();
        this.$log.debug('down', event);
        this.socket.ready().then(() => {
            this.socket.move('down');
        });
    }

    stop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.$log.debug('stop', event);
        this.socket.ready().then(() => {
            this.socket.stop();
        });
    }

    static get $inject() {
        return ['$log', 'Socket', '$scope'];
    }
}
