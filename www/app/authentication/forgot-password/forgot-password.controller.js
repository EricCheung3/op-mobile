(function() {
    'use strict';

    angular
        .module('openprice.mobile')
        .controller('ForgotPasswordController', ForgotPasswordController);

    /* @ngInject */
    function ForgotPasswordController($scope, $state, apiService) {
        var vm = this;
        vm.user = {
            email: ''
        };
        vm.resetClick = resetClick;

        function resetClick(user) {
            console.log('Send reset password request to server...');
            apiService
            .getWebsiteResource()
            .then( function( websiteResource ) {
                //console.log("websiteResource", websiteResource);
                // TODO add email not exist check
                return websiteResource.$post('forgetPassword', {}, user);
            })
            .then( function(response) {
                console.log('forgot password returned:', response);
                //TODO error handling
                $state.go('login');
            });
        }
    }
})();
