(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('StoreShoppingListController', StoreShoppingListController);

    StoreShoppingListController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', '$stateParams', 'storeService', '$ionicPopup', '$state', 'searchService'];

    function StoreShoppingListController(   $log,   $rootScope,   $scope,   $location,   apiService ,  $stateParams ,  storeService ,  $ionicPopup ,  $state,   searchService) {
        $log.debug('==> StoreShoppingListController test');

        var vm = this;
        vm.store = null;
        vm.categoryMap = {};
        vm.totalNumber = 0;
        vm.totalPrice = 0;

        vm.shouldShowDelete = false; //?
        vm.listCanSwipe = true;

        vm.plusItemNumber = plusItemNumber;
        vm.minusItemNumber = minusItemNumber;
        vm.deleteItem = deleteItem;

        vm.model = ""; //value is then saved in the defined ng-model ??? What is this?
        vm.searchProductsFromServer = searchProductsFromServer;
        vm.itemsClicked = itemsClicked;
        vm.itemsRemoved = itemsRemoved;
        vm.doneSearch = doneSearch;

        vm.shoppingMode = false; // whether in shopping
        vm.goShoppingMode = goShoppingMode;
        vm.doneShoppingMode = doneShoppingMode;

        storeService.getStoreAllItems($stateParams.storeId, function(store){
            console.log(store);
            vm.store = store;
            vm.totalNumber = vm.store.items.length;
            vm.store.items.forEach(function (shoppingItem) {
                addShoppingItemToCategory(shoppingItem);
            });
            calculateTotalSubtotal();
            console.log('categoryMap is :', vm.categoryMap);
        });

        // ---------------------------------------------------------------------
        // public functions for UI

        function plusItemNumber(item) {
            item.number = item.number + 1;
            calculateTotalSubtotal();
        };

        function minusItemNumber(item) {
            if (item.number > 1) {
                item.number = item.number - 1;
                calculateTotalSubtotal();
            }
        };

        function deleteItem(index,item) {
            vm.totalNumber = vm.totalNumber - 1;
            var category = item.category;
            item.shoppingIte.$del('self')
            category.items.splice(index, 1);
            if (category.items.length === 0) {
                delete vm.categoryMap[category.code];
            }
            calculateTotalSubtotal();
        };

        // parameter must be named "query", see ion-autocomplete for detail
        function searchProductsFromServer(query) {
            // items should come from remote server
            if (query) {
                return searchService.searchItems(vm.store.id, query);
            }
            // add selected items to shoppinglist
            // return {items: []};
            vm.externalModel = []; // use to clear the selected items
        };

        // parameter must be named "callback"
        function itemsClicked(callback) {
            console.log('callback',callback);
            //addToShoppingList(callback.item);
        };

        function itemsRemoved(callback) {
            console.log('callback',callback);
        };

        function doneSearch(callback) {
            console.log("Done",callback); // this will return an array
            // add selected items to shopping list
            addToShoppingList(callback.selectedItems);
            vm.search = !vm.search; // hide search box
        };

        function goShoppingMode(){
            vm.shoppingMode = !vm.shoppingMode;
        };

        function doneShoppingMode(category){
            vm.shoppingMode = !vm.shoppingMode;
            /*
            // clear checked items
            for(var i=0;i<category["Uncategorized"].length;i++){
                if(category["Uncategorized"][i].checked)
                  category["Uncategorized"][i].checked = !category["Uncategorized"][i].checked;
                console.log("item-checked", category["Uncategorized"][i].checked);
            }
            */
            $state.go('app.dashboard.shoppinglist');
        };

        // ---------------------------------------------------------------------
        // private functions

        function addShoppingItemToCategory(shoppingItem) {
            var item = {
                name : shoppingItem.name,
                number : 1,
                showDetail : false,
                shoppingItem : shoppingItem
            };

            if(shoppingItem.catalog !== null) {
                item.code = shoppingItem.catalog.productCategory;
                item.catalog = shoppingItem.catalog;
                item.price = shoppingItem.catalog.price;
            } else {
                item.code = 'uncategorized';
                item.catalog = null;
                item.price = 0;
            }

            var category = vm.categoryMap[item.code];
            if (category === undefined) {
                category = {
                    code : item.code,
                    label : item.code,
                    items : [],
                    showDetail : false,
                    subtotal : 0,
                };
                vm.categoryMap[item.code] = category;
            }
            item.category = category;
            category.items.push(item);
        };

        function calculateTotalSubtotal() {
            vm.totalPrice = 0;
            for (var key in vm.categoryMap) {
                var category = vm.categoryMap[key];
                category.subtotal = 0;
                category.items.forEach( function(item){
                    category.subtotal = category.subtotal + Number(item.price) * item.number;
                })
                vm.totalPrice = vm.totalPrice + category.subtotal;
            }
        }

        function addToShoppingList(items) {
            console.log("=======>addToShoppingList");
            // add array to shoppinglist after click Done button
            items.forEach(function(item){
                var newItem = {
                    name : item.naturalName,
                    catalogCode : item.catalogCode
                };
                console.log('post new item:', newItem);
                vm.store
                .$post('items', {}, newItem)
                .then( function(location){
                    var itemId = location.substring(location.lastIndexOf('/') + 1);
                    loadShoppingItem(itemId);
                });
            });
        };

        function loadShoppingItem(itemId) {
            vm.store
            .$get('item', {'itemId': itemId})
            .then( function(shoppingItem){
                addShoppingItemToCategory(shoppingItem);
            });
        }
        //===== old code
        //----------------------------------------------------------------------


        vm.items = [];
        vm.lastItemsPage = null;

        vm.editItem = editItem;
        vm.clearShoppingList = clearShoppingList;
        vm.show = [];
        vm.number = [];
        vm.price = [];

        vm.pullToRefresh = pullToRefresh;
        vm.pullToSearch = pullToSearch;

        // for global display data
        vm.category = {};
        vm.subtotal = {};

        // for search items

        function editItem(index){
            console.log("edit item test");
            // need server API supporting
            // vm.items[index].$put(...)
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



        function pullToRefresh() {
            console.log("=========> pull to refresh");
            storeService.getStoreAllItems(storeId, function(store) {
                vm.items = store.items;
                categorizeItems(store.items, 1);
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        vm.search = true;
        function pullToSearch(){
            vm.search = !vm.search;
            $scope.$broadcast('scroll.refreshComplete');
        };

        //  most concise and efficient way to find out if a JavaScript array contains an obj use underscore.js
        function arrayContainsObj(arr, obj){
            for(var i=0; i<arr.length; i++) {
                if(arr[i].catalog !== null && (arr[i].catalog.id == obj.id)){
                    return true;
                }else {
                  if (arr[i].name == obj.naturalName)
                    return true;
                }
            }
        };

    }; // end of storeController

})();
