(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('storeItemsController', storeItemsController);

    storeItemsController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', '$stateParams', 'receiptService', '$ionicPopup', '$state'];

    function storeItemsController(   $log,   $rootScope,   $scope,   $location,   apiService ,  $stateParams ,  receiptService ,  $ionicPopup ,  $state) {
        $log.debug('==> storeController');

        var vm = this;
        vm.shouldShowDelete = false;
        vm.listCanSwipe = true;

        vm.store = null;
        vm.items = [];
        vm.lastItemsPage = null;
        vm.deleteItem = deleteItem;
        vm.editItem = editItem;
        vm.itemDetail = itemDetail;
        vm.clearShoppingList = clearShoppingList;
        vm.show = [];
        vm.show[1] = false;
        vm.show[2] = false;
        vm.goShoppingMode =goShoppingMode;
        vm.doneShoppingMode = doneShoppingMode;
        vm.shoppingMode = false;
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
            // click to display detail
            vm.items.forEach(function (item) {
                vm.show[item] = false;
            });
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
        };

        function moreItemsCanBeLoaded() {
            return vm.lastItemsPage !== null && vm.lastItemsPage.$has("next");
        };

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
        };

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

        function itemDetail(item) {
            vm.show[item] = !vm.show[item];
        };

        function goShoppingMode(){
            vm.shoppingMode = !vm.shoppingMode;
        };

        function doneShoppingMode(){
            vm.shoppingMode = !vm.shoppingMode;
            $state.go('app.dashboard.home');
        };

        function clearShoppingList(){
            var popup = $ionicPopup.confirm({
              // title: 'clear the ShoppingList',
              template: 'Are you sure to delete this shopping list?',
              buttons: [
                { text: 'Cancel' ,
                  type: 'button-positive',
                  onTap: function(e) {
                      popup.close();
                  }
                },
                { text: 'Delete',
                  type: 'button-positive',
                  onTap: function(e) {
                      console.log("clear the ShoppingList");
                      // delete function at here
                      popup.close();
                  }
                }
              ]
            });
        };

    }; // end of storeController

})();
