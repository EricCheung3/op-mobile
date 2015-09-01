(function () {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('loginController', loginController);

    loginController.$inject = ['$log', '$rootScope', '$scope', '$state', 'apiService'];

    function loginController(   $log,   $rootScope,   $scope,  $state,   apiService ) {
        $log.debug('==> loginController');

        /* jshint validthis: true */
        var vm = this;
        vm.credentials = {username: '', password: ''};
        vm.login = login;


        function login(credentials) {
            $log.debug("==> login() for "+credentials.username+"/"+credentials.password);

            apiService.authenticate(credentials, function(authenticated) {
                if (authenticated) {
                    $log.debug("Login succeeded")
                    $scope.error = false;
                    $state.go("app.dashboard.home");
                } else {
                    $log.debug("Login failed")
                    $scope.error = true; //TODO display error messages
                }
            });
        }

    };
})();
