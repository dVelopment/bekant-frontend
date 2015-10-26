'use strict';

import _ from 'lodash';

function preferences($resource, Api, $rootScope, APP_EVENTS) {
    let api, promise;

    function initialize() {
        return new Promise((resolve, reject) => {
            Api.requireApiUrl().then((url) => {
                api = $resource(url + '/api/preferences/:id', {id: '@_id'}, {
                    'update': {
                        method: 'PUT',
                        transformRequest: (data) => {
                            let tmp = _.extend({}, data);
                            delete tmp._id;

                            _.forEach(_.keys(tmp), (key) => {
                                if (/^\$/.test(key)) {
                                    delete tmp[key]
                                }
                            });

                            return JSON.stringify(tmp);
                        }
                    }
                });

                resolve();
            }, reject);
        });
    }

    promise = initialize();
    $rootScope.$on(APP_EVENTS.configured, initialize);

    let service;

    service = {
        ready: () => promise,

        createPreference: () => {
            return service.ready().then(() => new api());
        },

        query: () => api.query()
    };

    return service;
}

export default ['$resource', 'Api', '$rootScope', 'APP_EVENTS', preferences];
