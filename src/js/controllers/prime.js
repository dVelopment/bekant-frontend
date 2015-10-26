'use strict';

import _ from 'lodash';

export default class PrimeController {
    constructor($log, Socket, $scope) {
        this.$log = $log;
        this.socket = Socket;
        this.$scope = $scope;

        this.$scope.prime = this.onPrime.bind(this);
    }

    onPrime(event) {
        event.preventDefault();
        event.stopPropagation();

        this.socket.ready().then(() => {
            this.socket.prime();
        });
    }

    static get $inject() {
        return ['$log', 'Socket', '$scope'];
    }
}
