(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('dashboardController', dashboardController);

    dashboardController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService'];

    function dashboardController(   $log,   $rootScope,   $scope,  $location,   apiService ) {
        $log.debug('==> dashboardController');
    };

})();
