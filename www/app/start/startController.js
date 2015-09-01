(function() {
'use strict';

    angular
        .module('openpriceMobile')
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
                        $state.go("app.dashboard.home");
                    } else {
                        $rootScope.authenticated = false;
                        $rootScope.currentUser = null;
                        $state.go("login");
                        $log.debug("redirect to login");
                    }
                });
        };

    };

})();
