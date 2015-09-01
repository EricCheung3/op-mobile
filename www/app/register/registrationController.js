(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('registrationController', registrationController);

    registrationController.$inject = ['$log', '$rootScope', '$state', '$ionicPopup', 'apiService'];

    function registrationController(   $log,   $rootScope,   $state,   $ionicPopup,   apiService ) {
        $log.debug('==> registrationController');

        /* jshint validthis: true */
        var vm = this;
        vm.registration = {email: '', username: '', password: '', confirmPassword: ''};
        vm.register = register;

        function register(registration) {
            $log.debug('==> register() for '+registration.firstName+' '+registration.lastName);
            $log.debug('new username is '+registration.username);

            apiService
                .getWebsiteResource()
                .then( function( websiteResource ) {
                    return websiteResource.$post('registration', {}, registration);
                })
                .then( function() {
                    $ionicPopup.alert({
                        title: 'Welcome ' + registration.username,
                        cssClass: 'success',
                        content: 'Thank you for registering to OpenPrice.'
                    }).then(function(res) {
                        $log.debug('successfully registered, go to login page.');
                        $state.go('login');
                    });
                    
                })
                .catch( function(error) {
                    $log.debug('registration error: '+error.data);
                    if (error.status === 409) {
                        $ionicPopup.alert({
                            title: 'Error',
                            cssClass: 'error',
                            content: 'Username ' + registration.username + ' is already taken!'
                        });
                    }
                })
                ;
        }
    };

})();
