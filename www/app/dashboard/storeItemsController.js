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

        vm.store = null;
        vm.items = [];
        vm.lastItemsPage = null;
        vm.deleteItem = deleteItem;
        vm.pullToRefresh = pullToRefresh;
        vm.moreItemsCanBeLoaded = moreItemsCanBeLoaded;
        vm.scrollToLoadMore = scrollToLoadMore;

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
        });


        function pullToRefresh() {
            console.log("=========> pull to refresh");
            // load first page of items
            receiptService.loadFirstPageOfUserStoreItems(storeId, function(items, itemsPage) {
                vm.items = items;
                vm.lastItemsPage = itemsPage;
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        function moreItemsCanBeLoaded() {
            return vm.lastItemsPage !== null && vm.lastItemsPage.$has("next");
        }

        function scrollToLoadMore() {
            console.log("===========> scroll to load more");
            if(vm.lastItemsPage !== null && vm.lastItemsPage.$has("next")){
                vm.lastItemsPage
                .$get('next')
                .then(function(nextItemsList){
                    vm.lastItemsPage = nextItemsList;
                    return nextItemsList.$get('shoppingItems');
                }).then(function(items) {
                    items.forEach(function (item) {
                        vm.items.push(item);
                    });

                    // console.log("load more", vm.items);
                })
                .finally(function() {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }else {
                console.log("No next page now...");
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }



        function deleteItem(itemId){
            vm.items.splice(vm.items.indexOf(itemId), 1);
            console.log("DELETE-ITEM", itemId);
        };

    }; // end of storeController

})();
