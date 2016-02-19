(function() {
    'use strict';

    angular
        .module('openprice.mobile')
        .controller('ForgotPasswordController', ForgotPasswordController);

    /* @ngInject */
    function ForgotPasswordController($scope, $state, apiService, $ionicPopup) {
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
              $ionicPopup.alert({
                  title: 'New password link was sent to your Email',
                  cssClass: 'success',
                  content: 'Please check your Email to active and reset password.'
              }).then(function(response) {
                  console.log('forgot password returned:', response);
                  //TODO error handling
                  $state.go('login');
              });
            });
        }
    }
})();
