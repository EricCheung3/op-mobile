(function() {
    'use strict';

    angular
        .module('openprice.mobile')
        .controller('ForgotPasswordController', ForgotPasswordController);

    /* @ngInject */
    function ForgotPasswordController($scope, $state, $mdToast, $filter, $http, $location, apiService) {
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
                });
        }
    }
})();
