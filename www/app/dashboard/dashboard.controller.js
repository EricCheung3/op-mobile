(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService'];

    function DashboardController(   $log,   $rootScope,   $scope,  $location,   apiService ) {
        $log.debug('==> DashboardController');
    };

})();
