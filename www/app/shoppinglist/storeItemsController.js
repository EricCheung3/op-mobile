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
        vm.categoryDetail = categoryDetail;
        vm.addNewItem = addNewItem;
        vm.addItemNumber = addItemNumber;
        vm.minusItemNumber = minusItemNumber;
        vm.clearShoppingList = clearShoppingList;
        vm.show = [];
        vm.number = [];
        vm.price = [];

        vm.goShoppingMode =goShoppingMode;
        vm.doneShoppingMode = doneShoppingMode;
        vm.shoppingMode = false;
        vm.pullToRefresh = pullToRefresh;
        vm.moreItemsCanBeLoaded = moreItemsCanBeLoaded;
        vm.scrollToLoadMore = scrollToLoadMore;


        $scope.category = {};


        var storeId = $stateParams.storeId;
        console.log("storeId", storeId);

        //  get store info according to storeId
        apiService
            .getUserResource()
            .then(function (userResource) {
                userResource.$get('store', {storeId:storeId})
                .then(function(store){
                    vm.store = store.displayName;
                });
            });


        receiptService.loadFirstPageOfUserStoreItems(storeId, function(storeItems, itemsPage) {
            vm.items = storeItems;
            vm.lastItemsPage = itemsPage;
            console.log("Load first page items", storeItems.length);

            // click to display detail
            vm.items.forEach(function (item) {
                vm.show[item.labelCodes] = false;
                vm.number[item.name] = 1;
                vm.price[item] = item.id; // need to make sure
                vm.show[item.name] = false;
                //====do category===========
                if (item.labelCodes === null){
                    $scope.category["noCategory"] = [];
                }else {
                  $scope.category[item.labelCodes] = []; //NOTE: labelCodes should be labelCodes

                }
            });

            // vm.category
            vm.items.forEach(function (item) {
                vm.show[item.name] = false;
                //NOTE: catalogCode should be labelCodes
                if (item.labelCodes === null){
                    $scope.category["noCategory"].push(item);
                }else {
                    $scope.category[item.labelCodes].push(item);
                }
                // $scope.category[item.labelCodes].push(item);
                // vm.category[item.labelCodes].push({
                //     "name": item.displayName,
                //     "price": item.displayPrice
                // }); //NOTE: need price in shoping list
            });
            console.log("category", $scope.category);
            console.log("vm.show", vm.show);
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

        function deleteItem(index,item){
            console.log("DELETE-ITEM", vm.items[index].id);
            console.log("$scope.category[item.labelCodes]",$scope.category[item.labelCodes]);
            // vm.items[index].$del('self');
            if(item.labelCodes === null){
                $scope.category["noCategory"][index].$del('self');
                $scope.category["noCategory"].splice(index,1);
            }else {
                $scope.category[item.labelCodes][index].$del('self');
                $scope.category[item.labelCodes].splice(index,1);
            }
        };

        function itemDetail(item) {
            vm.show[item.name] = !vm.show[item.name];
            // console.log("$scope.category[item.labelCodes]",$scope.category[item.labelCodes][0]);

        };

        function categoryDetail(categoryLabel){
            console.log("category--item detail",categoryLabel);
            vm.show[categoryLabel] = !vm.show[categoryLabel];
        };


        function addNewItem() {
          var popup = $ionicPopup.confirm({
            title: 'Add New Item',
            subTitle: 'Please input item name and price',
            template: '<input type="text" ng-model="vm.item">',
            buttons: [
              { text: 'Cancel' ,
                type: 'button-positive',
                onTap: function(e) {
                    popup.close();
                }
              },
              { text: 'Add',
                type: 'button-positive',
                onTap: function(e) {
                  // add new ite function
                  if(vm.item==null){
                      //alert
                      popup.close();
                  }else {
                      popup.close();
                  }

                }
              }
            ]
          });
        };

        function addItemNumber(item){ // NOTE: parameter should be index
            vm.number[item.name] = vm.number[item.name] + 1;
            vm.price[item] = vm.price[item] + 2.43;
            // vm.price[item] = vm.price[item] + item.itemPrice;
        };

        function minusItemNumber(item){
            if(vm.number[item.name] > 1){
                vm.number[item.name] = vm.number[item.name] - 1;
                vm.price[item] = vm.price[item] - 2.43;
            }
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
              title: '<div class="text-center"> Are you sure you want to delete this shopping list?</div>',
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
                      vm.items.forEach(function (item){
                          console.log("item-self",item);
                          item.$del('self');
                      });
                      $scope.category = {};
                      popup.close();
                  }
                }
              ]
            });
        };

    }; // end of storeController

})();
