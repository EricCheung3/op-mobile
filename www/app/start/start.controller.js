(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('startController', startController);

    startController.$inject = ['$log', '$rootScope', '$state', '$cordovaSplashscreen', 'apiService'];

    function startController(   $log,   $rootScope,   $state,   $cordovaSplashscreen,   apiService ) {
        $log.debug('==> startController');

        loadCurrentSigninUser();

        function loadCurrentSigninUser() {
            apiService
            .getWebsiteResource()
            .then( function( websiteResource ) {

                if (websiteResource.authenticated) {
                    $log.debug("already logged in, go to main screen home tab");
                    $rootScope.authenticated = true;
                    $rootScope.currentUser = websiteResource.currentUser;
                    $state.go("app.dashboard.stores");
                } else if (websiteResource.serverError) {
                    $log.debug("error with api service, redirect to login");
                    //TODO add error messages
                    $state.go("login");
                } else {
                    $rootScope.authenticated = false;
                    $rootScope.currentUser = null;
                    $log.debug("not authenticated, redirect to login");
                    $state.go("login");
                }
            })
        };

    };

})();
