(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .run(run);

    run.$inject = ['$log', '$rootScope', '$ionicPlatform', '$state', '$stateParams', 'apiService']

    function run(   $log,   $rootScope,   $ionicPlatform,   $state,   $stateParams,   apiService) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        //apiService.init('http://108.59.83.3:7800'); // openprice-sys server
        apiService.init('http://104.197.47.140:7800'); // openprice-dev server


        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });

        $rootScope.logout = function() {
            apiService.clear();
            $state.go('login');
        };
    };

})();
