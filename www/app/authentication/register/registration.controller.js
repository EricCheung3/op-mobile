(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('RegistrationController', RegistrationController);

    RegistrationController.$inject = ['$log', '$rootScope', '$state', '$ionicPopup', 'apiService'];

    function RegistrationController(   $log,   $rootScope,   $state,   $ionicPopup,   apiService ) {
        $log.debug('==> RegistrationController');

        /* jshint validthis: true */
        var vm = this;
        vm.registration = {firstName: '', lastName: '', email: '', password: '', confirmPassword: ''};
        vm.register = register;

        function register(registration) {
            $log.debug('==> register() for '+registration.firstName+' '+registration.lastName);
            $log.debug('new username is '+registration.email);

            apiService
                .getWebsiteResource()
                .then( function( websiteResource ) {
                    return websiteResource.$post('registration', {}, registration);
                })
                .then( function() {
                    $ionicPopup.alert({
                        title: 'Welcome ' + registration.firstName+' '+registration.lastName,
                        cssClass: 'success',
                        content: 'Thank you for registering to OpenPrice.'
                    }).then(function(res) {
                        $log.debug('successfully registered, go to login page.');
                        //FIXME: HACK to add default stores
                        var credentials = {username: registration.email, password: registration.password};
                        apiService.authenticate(credentials, function(authenticated) {
                          if (authenticated) {
                              apiService.createDefaultStores();
                              $state.go("app.dashboard.receipts");
                          }
                        });
                    });

                })
                .catch( function(error) {
                    $log.debug('registration error: '+error.data);
                    if (error.status === 409) {
                        $ionicPopup.alert({
                            title: 'Error',
                            cssClass: 'error',
                            content: 'Email ' + registration.email + ' is already taken!'
                        });
                    }
                })
                ;
        }
    };

})();
