'use strict';

import _ from 'lodash';

function loadFile(path) {
    return new Promise((resolve, reject) => {
        let head = angular.element(document.getElementsByTagName('head')[0]);
        jQuery.ajax({
            url: path,
            dataType: 'script',
            success: () => {
                resolve();
            },
            error: () => {
                console.error('could not load file', path);
                reject();
            },
            async: true
        });
    });
}
const SERVICES = Symbol();


class BonjourBase {
    constructor(file = null) {
        if (file) {
            this.promise = loadFile(file);
        } else {
            this.promise = new Promise((resolve) => {
                // just resolve immediately, since we don't do anything
                resolve();
            });
        }

        this[SERVICES] = [];
    }

    get services() {
        return this[SERVICES];
    }

    ready() {
        return this.promise;
    }

    createEntry(host, port, name = null) {
        return {
            host: host.replace(/\.$/, ''),
            port: port,
            name: name || host
        };
    }

    removeService(name) {
        _.remove(this[SERVICES], (s) => s.name === name);
    }

    addService(host, port, name = null) {
        this[SERVICES].push(this.createEntry(host, port, name));
    }
}

class BonjourDummy extends BonjourBase{
    constructor() {
        super();
    }
}

class BonjourIos extends BonjourBase {
    constructor() {
        super('js/dnssd.js');

        this.ready().then(() => {
            window.plugins.dnssd.browse(
                '_bekant._tcp',
                'local',
                this.onServiceFound.bind(this),
                this.onServiceLost.bind(this)
            );
        });
        this.resolveStack = [];
        this.resolving = false;
    }

    resolveService(serviceName, regType, domain) {
        if (this.resolving) {
            this.resolveStack.push(_.values(arguments));
        } else {
            this.resolving = true;
            window.plugins.dnssd.resolve(serviceName, regType, domain, this.onServiceResolved.bind(this));
        }
    }

    onServiceResolved(hostName, port, serviceName, regType, domain) {
        this.resolving = false;
        this.addService(hostName, port, serviceName);

        if (this.resolveStack.length) {
            let args = this.resolveStack.pop();
            this.resolveService.apply(this, args);
        }
    }

    onServiceFound(serviceName, regType, domain, moreComing) {
        this.resolveService(serviceName, regType, domain);
    }

    onServiceLost(serviceName, regType, domain, moreComing) {
        this.removeService(serviceName);
    }
}

class BonjourAndroid {

}

class Bonjour {
    constructor($ionicPlatform, $log) {
        this.promise = new Promise((resolve, reject) => {
            $ionicPlatform.ready().then(() => {
                $log.debug('[Bonjour] ready', ionic.Platform.isIOS());
                if (ionic.Platform.isIOS()) {
                    this.handler = new BonjourIos();
                } else if (ionic.Platform.isAndroid()) {
                    this.handler = new BonjourAndroid();
                } else {
                    this.handler = new BonjourDummy();
                }
                $log.debug('[Bonjour] ios, android', ionic.Platform.isIOS(), ionic.Platform.isAndroid(), ionic.Platform.device());
                resolve();
            });
        });
    }

    get services() {
        return this.handler ? this.handler.services : null;
    }

    ready() {
        return this.promise.then(() => {
            return this.handler.ready();
        });
    }
}

export default ['$ionicPlatform', '$log', ($ionicPlatform, $log) => {
    return new Bonjour($ionicPlatform, $log);
}];
