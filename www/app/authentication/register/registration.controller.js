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
        vm.processing = false;
        vm.registration = {firstName: '', lastName: '', email: '', password: '', confirmPassword: ''};
        vm.register = register;

        function register(registration) {
            vm.processing = true;

            apiService
                .getWebsiteResource()
                .then( function( websiteResource ) {
                    return websiteResource.$post('registration', {}, registration);
                })
                .then( function() {
                    vm.processing = false;
                    $ionicPopup.alert({
                        title: 'Welcome ' + registration.firstName + '!',
                        cssClass: 'success',
                        content: 'Thanks for joining the community of Openprice users.'
                    }).then(function(res) {
                        //FIXME: HACK to add default stores
                        var credentials = {username: registration.email, password: registration.password};
                        apiService.authenticate(credentials, function(authenticated) {
                          if (authenticated) {
                              apiService.createDefaultStores(function() {
                                  $state.go("app.dashboard.stores");
                                  document.activeElement.blur();
                              });
                          }
                        });
                    });

                })
                .catch( function(error) {
                    $log.debug('registration error: '+error.data);
                    vm.processing = false;
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
