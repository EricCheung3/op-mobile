(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('FriendsController', FriendsController);

    FriendsController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService'];

    function FriendsController(   $log,   $rootScope,   $scope,  $location,   apiService ) {
        $log.debug('==> FriendsController');

        // TODO add functions to handle camera
    };

})();
