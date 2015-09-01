(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('friendsController', friendsController);

    friendsController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService'];

    function friendsController(   $log,   $rootScope,   $scope,  $location,   apiService ) {
        $log.debug('==> friendsController');

        // TODO add functions to handle camera
    };

})();
