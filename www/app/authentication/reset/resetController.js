(function() {
    'use strict';

    angular
        .module('openpriceMobile')
        .controller('ResetController', ResetController);

    /* @ngInject */
    function ResetController($scope, $state, $stateParams, $mdToast, $filter, $http, triSettings, apiService) {
        var vm = this;
        vm.triSettings = triSettings;
        vm.user = {
            newPassword: '',
            confirm: ''
        };
        vm.resetClick = resetClick;
        // var id = $stateParams.id;
        var id = "78e0784f-46ef-4640-9434-be56ce24ed50";
        ////////////////

        function resetClick(newPassword) {
            apiService
                .getWebsiteResource()
                .then( function( websiteResource ) {
                    return websiteResource.$get('resetPassword/'+id);
                })
                .then(function(data) {
                    console.log("data",data);
                });
        }
    }
})();
