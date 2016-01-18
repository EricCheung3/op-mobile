(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .filter('object2Array', function() {
            return function(input) {
                var out = [];
                for(var i in input){
                    out.push(input[i]);
                }
                return out;
            }
        })
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
        vm.editItem = editItem;
        vm.deleteItem = deleteItem;

        vm.model = ""; //value is then saved in the defined ng-model, used by ion-autocomplete. Do we need this?
        vm.searchProductsFromServer = searchProductsFromServer;
        vm.itemsClicked = itemsClicked;
        vm.itemsRemoved = itemsRemoved;
        vm.doneSearch = doneSearch;

        vm.shoppingMode = false; // whether in shopping
        vm.goShoppingMode = goShoppingMode;
        vm.doneShoppingMode = doneShoppingMode;

        vm.clearShoppingList = clearShoppingList;

        storeService.getStoreAllItems($stateParams.storeId, function(store){
            //console.log(store);
            vm.store = store;
            vm.totalNumber = vm.store.items.length;
            vm.store.items.forEach(function (shoppingItem) {
                addShoppingItemToCategory(shoppingItem);
            });
            calculateTotalSubtotal();
            //console.log('categoryMap is :', vm.categoryMap);
        });

        // ---------------------------------------------------------------------
        // public functions for UI

        function plusItemNumber(item) {
            item.number = item.number + 1;
            updateShoppingItem(item);
            calculateTotalSubtotal();
        };

        function minusItemNumber(item) {
            if (item.number > 1) {
                item.number = item.number - 1;
                updateShoppingItem(item);
                calculateTotalSubtotal();
            }
        };

        function editItem(index){
            console.log("edit item test");
        };

        function deleteItem(index,item) {
            vm.totalNumber = vm.totalNumber - 1;
            var category = item.category;
            item.shoppingItem.$del('self')
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
            $state.go('app.dashboard.shoppinglist');
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
                      vm.store.items.forEach(function (item){
                          console.log("item-self",item);
                          item.$del('self');
                      });
                      vm.categoryMap = {};
                      vm.totalNumber = 0;
                      vm.totalPrice = 0;
                      popup.close();
                  }
                }
              ]
            });
        };

        // ---------------------------------------------------------------------
        // private functions

        // helper function to add shoppingItem loaded from server to UI category
        function addShoppingItemToCategory(shoppingItem) {
            var item = {
                name : shoppingItem.name,
                number : shoppingItem.number,
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

        // after user selects search result or creates item, add it to shopping list
        function addToShoppingList(items) {
            console.log("=======>addToShoppingList");
            // add array to shoppinglist after click Done button
            items.forEach(function(item){

              // new item belong to our catalog
              if(item.productCategory !== undefined) {
                // if item category existed in shoppinglist
                if (vm.categoryMap[item.productCategory] !== undefined) {

                  if (categoryContainsItem(vm.categoryMap[item.productCategory].items, item)){
                    console.log("exist category exist item: just add item number");
                  }else {
                    console.log("exist category but new item: add item to the category");
                    postToDataBase(item);
                  }
                }else {// if item belongs to new category in shoppinglist
                  console.log("new category / new item");
                  postToDataBase(item);
                }
              // item is not in our catalog, they belong to [uncategorized]
              }else {
                // if item in [uncategorized]
                if (categoryContainsItem(vm.categoryMap.uncategorized.items, item)){
                  item.number = item.number + 1;
                  item.price = item.price + 0;
                }else {
                  postToDataBase(item);
                }
              }
              // re-calculate the price
              calculateTotalSubtotal();
            });
        };

        function postToDataBase(item){
            var newItem = {
                name : item.naturalName,
                catalogCode : item.catalogCode,
                number : 1
            };
            console.log('post new item:', newItem);
            vm.store
            .$post('items', {}, newItem)
            .then( function(location){
                var itemId = location.substring(location.lastIndexOf('/') + 1);
                loadShoppingItem(itemId);
            });
        };

        function loadShoppingItem(itemId) {
            vm.store
            .$get('item', {'itemId': itemId})
            .then( function(shoppingItem){
                addShoppingItemToCategory(shoppingItem);
            });
        };

        function updateShoppingItem(item) {
            var itemForm = {
                name : item.name,
                number : item.number
            };
            item.shoppingItem.$put('self', {}, itemForm)
            .then( function() {
                item.shoppingItem.$get('self')
                .then( function(shoppingItem) {
                    console.log('Updated shopping item is ', shoppingItem);
                    item.shoppingItem = shoppingItem; //update it
                });
            });
        };

    }; // end of storeController

})();
