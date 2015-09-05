(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('storeItemsController', storeItemsController);

    storeItemsController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', '$stateParams', 'receiptService'];

    function storeItemsController(   $log,   $rootScope,   $scope,   $location,   apiService ,  $stateParams ,  receiptService) {
        $log.debug('==> storeController');

        var vm = this;
        vm.shouldShowDelete = false;
        vm.listCanSwipe = true;

        vm.items = [];
        vm.deleteItem = deleteItem;

        var storeId = $stateParams.storeId;
        console.log("storeId", storeId);

        receiptService.getStoreItemsResource(storeId)
        .then(function(items){
            vm.items = items;
            console.log("items", items);
        });


        function deleteItem(itemId){
            vm.items.splice(vm.items.indexOf(itemId), 1);
            console.log("DELETE-ITEM", itemId);
        };

    }; // end of storeController

})();
