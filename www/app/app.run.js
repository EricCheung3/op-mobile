(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .run(run);

    run.$inject = ['$log', '$rootScope', '$ionicPlatform', '$state', '$stateParams', 'apiService', 'EnvironmentConfig', 'UserReceiptData', 'ionicToast']

    function run(   $log,   $rootScope,   $ionicPlatform,   $state,   $stateParams,   apiService,   EnvironmentConfig,   UserReceiptData,   ionicToast) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        apiService.init(EnvironmentConfig.api);

        $ionicPlatform.ready(function() {
            document.addEventListener("offline", onOffline, false);
            function onOffline() {
                // Handle the offline event
                ionicToast.show('You are offline now, the network is disconnected. Please check your network status and try it again', 'top', false, 5000);
            }

            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });

        $rootScope.logout = function() {
            UserReceiptData.refresh();
            apiService.clear();
            $state.go('login');
        };
    };

})();
