(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('shoppingListController', shoppingListController);

    shoppingListController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService'];

    function shoppingListController(   $log,   $rootScope,   $scope,   $location,   apiService ) {
        $log.debug('==> shoppingListController');



    };

})();
