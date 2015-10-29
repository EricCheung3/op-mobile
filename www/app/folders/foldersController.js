(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('foldersController', foldersController);

    foldersController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService'];

    function foldersController(   $log,   $rootScope,   $scope,  $location,   apiService ) {
        $log.debug('==> foldersController');

        // TODO add functions to handle camera
    };

})();
