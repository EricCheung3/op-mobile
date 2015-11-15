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
        vm.pullToRefresh = pullToRefresh;
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


        //vm.pullToRefresh();

        function pullToRefresh(){
            $log.debug('==> stores pullToRefresh');
            receiptService
            .loadFirstPageOfUserStores( function(storeList, storeListPage) {
                vm.stores = storeList;
                vm.lastStoreListPage = storeListPage;
                console.log("stores",storeList);
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

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
