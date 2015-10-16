(function() {
    'use strict';

    angular
        .module('openpriceMobile')
        .controller('forgotController', forgotController);

    /* @ngInject */
    function forgotController($scope, $state, $mdToast, $filter, $http, $location, apiService) {
        var vm = this;
        vm.user = {
            email: ''
        };
        vm.resetClick = resetClick;

        function resetClick(reset) {
            apiService
                .getWebsiteResource()
                .then( function( websiteResource ) {
                    // add email not exist check
                    return websiteResource.$post('forgetPassword', {}, reset);
                })
                .then(function() {
                    $state.go('reset');
                }).
                then(function() {
                    $state.go('forgot');
                });
        }
    }
})();
