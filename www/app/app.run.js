(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .run(run);

    run.$inject = ['$log', '$rootScope', '$ionicPlatform', '$state', '$stateParams', 'apiService', 'EnvironmentConfig', 'ngFB']

    function run(   $log,   $rootScope,   $ionicPlatform,   $state,   $stateParams,   apiService,   EnvironmentConfig,   ngFB) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        apiService.init(EnvironmentConfig.api);

        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            // if (window.cordova && window.cordova.plugins.Keyboard) {
            //     cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            // }
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
