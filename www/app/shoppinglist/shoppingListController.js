(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('shoppingListController', shoppingListController);

    shoppingListController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService' , '$state', 'receiptService'];

    function shoppingListController(   $log,   $rootScope,   $scope,   $location,   apiService ,   $state ,  receiptService) {
        $log.debug('==> shoppingListController');

        var vm = this;
        vm.stores = [];
        vm.showStoreItems = showStoreItems;
        vm.deleteStore = deleteStore;
        vm.addNewStore = addNewStore;

        vm.shouldShowDelete = false;
        vm.listCanSwipe = true;


        receiptService.getStoresResource()
        .then(function(stores){
            console.log("stores", stores);
            vm.stores = stores;
        });

        function showStoreItems(storeId){
            $state.go('app.dashboard.store',{storeId:storeId});
        };

        function deleteStore(index){

            console.log("DELETE-STORE",vm.stores[index]);
            vm.stores[index].$del('self');
            vm.stores.splice(index, 1);
        };

        function addNewStore(){
            console.log("add new store at here");
        };

    }; // end of shoppingListController

})();
