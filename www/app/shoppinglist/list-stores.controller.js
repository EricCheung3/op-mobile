(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('StoreListController', StoreListController);

    StoreListController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService' , '$state', 'UserShoppingData'];

    function StoreListController(   $log,   $rootScope,   $scope,   $location,   apiService ,   $state ,  UserShoppingData) {
        $log.debug('==> StoreListController');

        var vm = this;
        vm.stores = [];
        vm.pullToRefresh = pullToRefresh;
        vm.showShoppingStore = showShoppingStore;
        vm.deleteStore = deleteStore;
        vm.addNewStore = addNewStore;

        UserShoppingData
        .loadFirstPage()
        .then( function(stores) {
            console.log('init : ', stores);
            vm.stores = stores;
        });

        function pullToRefresh(){
            $log.debug('==> StoreListController.pullToRefresh');
            UserShoppingData
            .loadFirstPage()
            .then( function(stores) {
                vm.stores = stores;
            })
            .finally( function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        function showShoppingStore(store){
            $state.go('app.dashboard.store',{storeId:store.resource.id});
        };

        function deleteStore(store){
            store.resource.$del('self');
            var index = vm.stores.indexOf(store);
            if (index > -1) {
                vm.stores.splice(index, 1);
            }
        };

        function addNewStore(){
            console.log("add new store at here");
        };

    }; // end of StoreListController

})();
