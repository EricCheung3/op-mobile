(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('storeItemsController', storeItemsController);

    storeItemsController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', '$stateParams', 'receiptService', '$ionicPopup', '$state', 'searchService'];

    function storeItemsController(   $log,   $rootScope,   $scope,   $location,   apiService ,  $stateParams ,  receiptService ,  $ionicPopup ,  $state,   searchService) {
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

        // for global display data
        $scope.category = {};
        $scope.totalNumber = 0;
        $scope.totalPrice = 0;
        $scope.subtotal = {};

        // for search items
        vm.searchItemsFromServer = searchItemsFromServer;
        vm.itemsClicked = itemsClicked;
        vm.itemsRemoved = itemsRemoved;
        vm.doneSearch = doneSearch;


        var storeId = $stateParams.storeId;
        console.log("storeId", storeId);

        //  get store info according to storeId
        apiService
            .getUserResource()
            .then(function (userResource) {
                userResource.$get('store', {storeId:storeId})
                .then(function(store){
                    vm.store = store;
                });
            });



        receiptService.loadFirstPageOfUserStoreItems(storeId, function(storeItems, itemsPage) {
            vm.items = storeItems;
            vm.lastItemsPage = itemsPage;
            console.log("Load first page items", storeItems);
            $scope.totalNumber = storeItems.length
            // click to display detail
            vm.items.forEach(function (item) {
                if(item.catalog !== null){
                  vm.show[item.catalog.labelCodes] = false;
                  vm.number[item.name] = 1;
                  vm.price[item.name] = item.catalog.price; // need to make sure
                  vm.show[item.name] = false;
                  $scope.category[item.catalog.labelCodes] = [];
                  $scope.subtotal[item.catalog.labelCodes] = 0;
                }else {
                  vm.show["noCategory"] = false;
                  vm.number[item.name] = 1;
                  vm.price[item.name] = 0; // need to make sure
                  vm.show[item.name] = false;
                  $scope.category["noCategory"] = [];
                  $scope.subtotal["noCategory"] = 0;
                }
                //console.log("item----------",item);
                $scope.totalPrice = Number($scope.totalPrice) + Number(vm.price[item.name]);
            });

            // vm.category
            vm.items.forEach(function (item) {
                vm.show[item.name] = false;
                //NOTE: catalogCode should be labelCodes
                if (item.catalog === null){

                    $scope.category["noCategory"].push(item);
                    $scope.subtotal["noCategory"] = Number($scope.subtotal["noCategory"]) + 0;
                }else {
                    $scope.category[item.catalog.labelCodes].push(item);
                    $scope.subtotal[item.catalog.labelCodes] = Number($scope.subtotal[item.catalog.labelCodes]) + Number(vm.price[item.name]);
                }

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
            $scope.totalNumber = $scope.totalNumber - 1;
            $scope.totalPrice = Number($scope.totalPrice) - Number(vm.price[item.name]);
            if(item.catalog === null){
                $scope.category["noCategory"][index].$del('self');
                $scope.category["noCategory"].splice(index,1);
                if($scope.category["noCategory"].length == 0){
                    delete $scope.category["noCategory"];
                }
            }else {
                $scope.category[item.catalog.labelCodes][index].$del('self');
                $scope.category[item.catalog.labelCodes].splice(index,1);
                if($scope.category[item.catalog.labelCodes].length == 0){
                    delete $scope.category[item.catalog.labelCodes];
                }
            }
            // console.log("$scope.category length 2",$scope.category[item.catalog.labelCodes].length);

        };

        function itemDetail(item) {
            vm.show[item.name] = !vm.show[item.name];
            // console.log("$scope.category[item.catalog.labelCodes]",$scope.category[item.catalog.labelCodes][0]);

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
          if (item.catalog === null) {
            vm.price[item.name] = 0;
          }else {
            vm.price[item.name] = Number(vm.price[item.name]) + Number(item.catalog.price);
            $scope.totalPrice = Number($scope.totalPrice) + Number(item.catalog.price);
            $scope.subtotal[item.catalog.labelCodes] = Number($scope.subtotal[item.catalog.labelCodes]) + Number(item.catalog.price);
          }

        };

        function minusItemNumber(item){
            if(vm.number[item.name] > 1){
              vm.number[item.name] = vm.number[item.name] - 1;
              if(item.catalog !== null){
                vm.price[item.name] = Number(vm.price[item.name]) - Number(item.catalog.price);
                $scope.totalPrice = $scope.totalPrice - Number(item.catalog.price);
                $scope.subtotal[item.catalog.labelCodes] = Number($scope.subtotal[item.catalog.labelCodes]) - Number(item.catalog.price);
              }else {
                vm.price[item.name] = 0;
              }
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
                      $scope.totalNumber = 0;
                      $scope.totalPrice = 0;
                      popup.close();
                  }
                }
              ]
            });
        };

        // search test from remote server
        $scope.model = "";

        // parameter must be named "query", see ion-autocomplete for detail
        function searchItemsFromServer(query) {
            // items should come from remote server
            if (query) {
                return searchService.searchItems(storeId, query);
            }
            // add selected items to shoppinglist
            return {items: []};
        };

        // parameter must be named "callback"
        function itemsClicked(callback) {
            console.log('callback',callback);
        };
        function itemsRemoved(callback) {
            console.log('callback',callback);
        };
        function doneSearch(callback) {
            console.log("Done",callback);
            // add selected items to shopping list
            // addToShoppingList(vm.store.chainCode, callback.selectedItems);
        }


        function addToShoppingList(chainCode,items){
            console.log("=======>addToShoppingList");

            var object = {
                          "chainCode" : chainCode, //receipt.chainCode
                          "items" : items
                         };
            console.log("added items obect", object);

            // post to database
            apiService.getUserResource()
            .then(function (userResource) {
                userResource.$post('shoppingList', {}, object)
                  .then(function(){
                      console.log("result", "success");
                  });
            });
        };




    }; // end of storeController

})();
