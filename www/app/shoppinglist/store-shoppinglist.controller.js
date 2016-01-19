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
        vm.storeId = $stateParams.storeId;
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
        vm.cancelSearch = cancelSearch;

        vm.shoppingMode = false; // whether in shopping
        vm.goShoppingMode = goShoppingMode;
        vm.doneShoppingMode = doneShoppingMode;

        vm.clearShoppingList = clearShoppingList;

        reloadShoppingList();

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

        function editItem(item){
            $scope.itemForm = {
                name: item.name,
                number: item.number,
                code: item.code
                };

            var popup = $ionicPopup.show({
                title: 'Edit Item',
                // subTitle: 'Please input item name and price',
                scope: $scope,
                // TODO add category dropdown list
                template: '<input type="text" placeholder="item name" ng-model="itemForm.name"><input type="number" placeholder="item number" ng-model="itemForm.number" >',
                buttons: [
                    { text: 'Cancel' ,
                      type: 'button-positive',
                      onTap: function(e) {
                          popup.close();
                      }
                    },
                    { text: 'Save',
                      type: 'button-positive',
                      onTap: function(e) {
                        return $scope.itemForm;
                      }
                    }
                ]
            });

            popup.then(function(itemForm) {
                if (itemForm === undefined ) {
                    console.log('cancel');
                } else if (itemForm.name!==null&&itemForm.number!==null&& itemForm.name!== undefined&&itemForm.number!== undefined) {
                    // update shoping item
                    item.name = itemForm.name;
                    item.number = itemForm.number;
                    item.code = itemForm.code;
                    updateShoppingItem(item);
                } else {
                    console.log('Input is illegal');
                }
             });

        };

        function deleteItem(item) {
            item.shoppingItem.$del('self')
            reloadShoppingList();
        };

        //---------- Search ----------
        // parameter must be named "query", see ion-autocomplete for detail
        function searchProductsFromServer(query) {
            // items should come from remote server
            if (query) {
                return searchService.searchItems(vm.storeId, query);
            }
            vm.externalModel = []; // use to clear the selected items
        };

        // parameter must be named "callback"
        function itemsClicked(callback) {
            addToShoppingList(callback.item);
            vm.externalModel = []; // use to clear the selected items
        };

        function cancelSearch(callback) {
            vm.externalModel = []; // use to clear the selected items
        };

        // ---------- Shopping Mode ----------
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

        function reloadShoppingList() {
            storeService.getStoreAllItems(vm.storeId, function(store){
                //console.log(store);
                vm.categoryMap = {}; // clear category
                vm.store = store;
                vm.totalNumber = vm.store.items.length;
                vm.store.items.forEach(function (shoppingItem) {
                    addShoppingItemToCategory(shoppingItem);
                });
                calculateTotalSubtotal();
                //console.log('categoryMap is :', vm.categoryMap);
            });
        }

        // helper function to add shoppingItem loaded from server to UI category
        function addShoppingItemToCategory(shoppingItem) {
            var item = {
                code : shoppingItem.productCategory,
                name : shoppingItem.name,
                number : shoppingItem.number,
                showDetail : false,
                shoppingItem : shoppingItem
            };

            if(shoppingItem.catalog !== null) {
                item.price = shoppingItem.catalog.price;
            } else {
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
        function addToShoppingList(item) {
            //console.log("add item to shopping list", item);
            var itemForm = {
                name : item.naturalName,
                catalogCode : item.catalogCode,
                number : 1
            };
            createShoppingItem(itemForm);
        };

        function createShoppingItem(itemForm) {
            vm.store
            .$post('items', {}, itemForm)
            .then( function(location){
                var itemId = location.substring(location.lastIndexOf('/') + 1);
                reloadShoppingList(); // to simplify the process, just refresh the whole item llist
            });

        };

        function updateShoppingItem(item) {
            var itemForm = {
                name : item.name,
                number : item.number,
                categoryCode : item.code
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
