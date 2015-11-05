(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('shoppingModeController', shoppingModeController);

    shoppingModeController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', '$stateParams', 'receiptService', '$state'];

    function shoppingModeController(   $log,   $rootScope,   $scope,   $location,   apiService ,  $stateParams ,  receiptService ,  $state) {
        $log.debug('==> storeController');

        var vm = this;
        vm.shouldShowDelete = false;
        vm.listCanSwipe = true;

        vm.store = null;
        vm.items = [];
        vm.lastItemsPage = null;
        vm.deleteItem = deleteItem;
        vm.editItem = editItem;
        vm.show = [];
        vm.show[1] = false;
        vm.show[2] = false;
        vm.goShoppingMode =goShoppingMode;

        var storeId = $stateParams.storeId;
        console.log("storeId", storeId);

        //  get store info according to storeId
        apiService
            .getUserResource()
            .then(function (userResource) {
                userResource.$get('store', {storeId:storeId})
                .then(function(store){
                    vm.store = store.name;
                });
            });

        receiptService.loadFirstPageOfUserStoreItems(storeId, function(storeItems, itemsPage) {
            vm.items = storeItems;
            vm.lastItemsPage = itemsPage;
            console.log("Load first page items", storeItems);
            // click to display detail
            vm.items.forEach(function (item) {
                vm.show[item] = false;
            });
        });

        function editItem(index){
            console.log("edit item test");
            // need server API supporting
            // vm.items[index].$put(...)
        };

        function deleteItem(index){
            console.log("DELETE-ITEM", vm.items[index].id);
            vm.items[index].$del('self');
            vm.items.splice(index, 1);

        };

        function goShoppingMode(){
            $state.go('app.dashboard.shoppingMode');
        };


    }; // end of storeController

})();
