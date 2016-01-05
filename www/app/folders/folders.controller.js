(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('FoldersController', FoldersController);

    FoldersController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService'];

    function FoldersController(   $log,   $rootScope,   $scope,  $location,   apiService ) {
        $log.debug('==> FoldersController');

        // TODO add functions to handle camera
    };

})();
