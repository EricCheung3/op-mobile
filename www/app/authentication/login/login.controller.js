(function () {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$log', '$rootScope', '$scope', '$state', 'apiService', 'ngFB'];

    function LoginController(   $log,   $rootScope,   $scope,   $state,   apiService,   ngFB ) {
        $log.debug('==> LoginController');

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

        // login with Facebook
        $scope.fbLogin = function () {
            ngFB.login({scope: 'email'}).then(
                function (response) {
                    if (response.status === 'connected') {
                        console.log('Facebook login succeeded');
                        // $scope.logout();
                        $scope.error = false;
                        $state.go("app.dashboard.home");
                    } else {
                        alert('Facebook login failed');
                    }
                });
        };

    };
})();
