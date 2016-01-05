(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('StoreListController', StoreListController);

    StoreListController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService' , '$state', 'storeService'];

    function StoreListController(   $log,   $rootScope,   $scope,   $location,   apiService ,   $state ,  storeService) {
        $log.debug('==> StoreListController');

        var vm = this;
        vm.stores = [];
        vm.pullToRefresh = pullToRefresh;
        vm.showStoreItems = showStoreItems;
        vm.deleteStore = deleteStore;
        vm.addNewStore = addNewStore;

        vm.shouldShowDelete = false;
        vm.listCanSwipe = true;


        storeService
            .getStoresResource()
            .then(function(stores){
                console.log("stores", stores);
                vm.stores = stores;
            });

        //vm.pullToRefresh();
        function pullToRefresh(){
            $log.debug('==> stores pullToRefresh');
            storeService
            .loadFirstPageOfUserStores( function(storeList, storeListPage) {
                vm.stores = storeList;
                vm.lastStoreListPage = storeListPage;
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
