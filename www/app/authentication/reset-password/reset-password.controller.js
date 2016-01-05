(function() {
    'use strict';

    angular
        .module('openprice.mobile')
        .controller('ResetPasswordController', ResetPasswordController);

    /* @ngInject */
    function ResetPasswordController($scope, $state, $stateParams, $mdToast, $filter, $http, apiService) {
        var vm = this;

        vm.user = {
            password: '',
            confirm: ''
        };
        vm.resetClick = resetClick;
        var id = $stateParams.id;

        ////////////////

        function resetClick(resetFrom) {
            var pwd = {"newPassword": resetFrom.password};
            console.log(pwd);
            apiService
                .getWebsiteResource()
                .then( function( websiteResource ) {
                    return websiteResource.$put('resetPassword/'+id, {}, pwd);
                })
                .then(function(res){
                    console.log("res", res);
                    $state.go('login');
                });

        }
    }
})();
