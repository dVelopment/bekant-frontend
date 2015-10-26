'use strict';


export default function (angular) {
    let app = angular.module('directives', []);


    app.directive('passwordMatch', () => {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: ($scope, $element, $attr, $ctrl) => {
                $ctrl.$parsers.unshift((viewValue) => {
                    let origin = $scope.$eval($attr.passwordMatch);

                    if (origin !== viewValue) {
                        $ctrl.$setValidity('passwordMatch', false);
                        return undefined;
                    } else {
                        $ctrl.$setValidity('passwordMatch', true);
                        return viewValue;
                    }
                });
            }
        };
    });
};
