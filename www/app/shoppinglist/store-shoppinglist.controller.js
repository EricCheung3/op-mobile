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

    StoreShoppingListController.$inject = ['$log', '$scope', 'apiService', '$stateParams', 'storeService', '$ionicPopup', '$state', 'UserShoppingData'];

    function StoreShoppingListController(   $log,   $scope,   apiService ,  $stateParams ,  storeService ,  $ionicPopup ,  $state,   UserShoppingData) {
        $log.debug('==> StoreShoppingListController');

        var vm = this;
        vm.categoryList;

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

        function ShoppingStore(storeId) {
            var vmstore = this;
            vmstore.storeId = storeId;
            vmstore.resource = null;
            vmstore.items = [];
            vmstore.categoryMap = {};
            vmstore.totalPrice = 0;
            vmstore.totalNumber = 0;

            vmstore.reload = function(focusItemId) {
                //console.log('==>ShoppingStore.reload() for '+vmstore.storeId);
                //empty category list for each code
                for (var code in  vmstore.categoryMap) {
                    vmstore.categoryMap[code].items = [];
                    vmstore.categoryMap[code].subtotal = 0;
                }

                UserShoppingData.loadShoppingStoreById(vmstore.storeId)
                .then( function(shoppingStore) {
                    //console.log("load shoppingStore:", shoppingStore);
                    vmstore.resource = shoppingStore;
                    vmstore.items = shoppingStore.items;
                    vmstore.items.forEach(function (shoppingItem) {
                        addShoppingItemToCategory(shoppingItem);
                    });
                    //console.log('categoryMap is :', vmstore.categoryMap);
                    for (var code in  vmstore.categoryMap) {
                        if (vmstore.categoryMap[code].items.length === 0) {
                            delete vmstore.categoryMap[code];
                        } else {
                            vmstore.categoryMap[code].items.forEach( function(item){
                                if (item.shoppingItem.id === focusItemId) {
                                    vmstore.categoryMap[code].showDetail = true;
                                }
                            });
                        }
                    };
                    calculateTotalSubtotal();
                });
            };

            function addShoppingItemToCategory(shoppingItem) {
                //console.log('==>ShoppingStore.addShoppingItemToCategory():', shoppingItem);
                var item = {
                    code : shoppingItem.categoryCode,
                    name : shoppingItem.name,
                    number : shoppingItem.number,
                    catalog : shoppingItem.catalog,
                    showDetail : false,
                    shoppingItem : shoppingItem
                };

                if(shoppingItem.catalog !== null) {
                    item.price = shoppingItem.catalog.price;
                } else {
                    item.price = 0;
                }

                var category = vmstore.categoryMap[item.code];
                if (category === undefined) {
                    category = {
                        code : item.code,
                        items : [],
                        showDetail : false,
                        subtotal : 0,
                    };
                    vm.categoryList.forEach( function(pc) {
                        if (pc.code === category.code) {
                            category.label = pc.label;
                        }
                    });

                    vmstore.categoryMap[item.code] = category;
                    //console.log('create new category:', category);
                }
                item.category = category;
                category.items.push(item);
            };

            function calculateTotalSubtotal() {
                vmstore.totalPrice = 0;
                for (var key in vmstore.categoryMap) {
                    var category = vmstore.categoryMap[key];
                    category.subtotal = 0;
                    category.items.forEach( function(item){
                        category.subtotal = category.subtotal + Number(item.price) * item.number;
                    })
                    vmstore.totalPrice = vmstore.totalPrice + category.subtotal;
                }
            }

        };

        apiService
        .getUserResource()
        .then(function (userResource) {
            return userResource.$get('categories')
        })
        .then( function(categories) {
            //console.log("categoryList", categories);
            vm.categoryList = categories;
            vm.store = new ShoppingStore($stateParams.storeId);
            vm.store.reload();
        });


        // ---------------------------------------------------------------------
        // public functions for UI

        function plusItemNumber(item) {
            item.number = item.number + 1;
            updateShoppingItem(item, false);
            calculateTotalSubtotal();
        };

        function minusItemNumber(item) {
            if (item.number > 1) {
                item.number = item.number - 1;
                updateShoppingItem(item, false);
                calculateTotalSubtotal();
            }
        };

        function editItem(item){
            $scope.itemForm = {
                name: item.name,
                number: item.number,
                code: item.code
                };
            $scope.categoryList = vm.categoryList;
            var popup = $ionicPopup.show({
                title: 'Edit Item',
                // subTitle: 'Please input item name and price',
                scope: $scope,
                // TODO add category dropdown list
                templateUrl: 'app/shoppinglist/edit-item.tmpl.html',
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
                    var reload = (item.code !== itemForm.code);
                    console.log("update item need reload : "+reload);
                    // update shoping item
                    item.name = itemForm.name;
                    item.number = itemForm.number;
                    item.code = itemForm.code;
                    updateShoppingItem(item, reload);
                } else {
                    console.log('Input is illegal');
                }
             });

        };

        function deleteItem(item) {
            item.shoppingItem.$del('self')
            .then( function() {
                reloadShoppingList();
            });
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

        function reloadShoppingList(focusItemId) {
            //empty category list for each code
            for (var code in  vm.categoryMap) {
                vm.categoryMap[code].items = [];
                vm.categoryMap[code].subtotal = 0;
            }

            storeService.getStoreAllItems(vm.storeId, function(store){
                //console.log(store);
                vm.store = store;
                vm.totalNumber = vm.store.items.length;
                vm.store.items.forEach(function (shoppingItem) {
                    addShoppingItemToCategory(shoppingItem);
                });
                calculateTotalSubtotal();
                //console.log('categoryMap is :', vm.categoryMap);
                for (var code in  vm.categoryMap) {
                    if (vm.categoryMap[code].items.length === 0) {
                        delete vm.categoryMap[code];
                    } else {
                        vm.categoryMap[code].items.forEach( function(item){
                            if (item.shoppingItem.id === focusItemId) {
                                vm.categoryMap[code].showDetail = true;
                            }
                        });
                    }
                };

            });
        }

        // helper function to add shoppingItem loaded from server to UI category
        function addShoppingItemToCategory(shoppingItem) {
            var item = {
                code : shoppingItem.productCategory,
                name : shoppingItem.name,
                number : shoppingItem.number,
                catalog : shoppingItem.catalog,
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
                    items : [],
                    showDetail : false,
                    subtotal : 0,
                };
                vm.categoryList.forEach(function(pc) {
                    if (pc.code === category.code) {
                        category.label = pc.label;
                    }
                });

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
                reloadShoppingList(itemId);
            });

        };

        function updateShoppingItem(item, reload) {
            var itemForm = {
                name : item.name,
                number : item.number,
                categoryCode : item.code
            };
            item.shoppingItem.$put('self', {}, itemForm)
            .then( function() {
                if (reload) {
                    reloadShoppingList(item.shoppingItem.id);
                }
            });
        };

    }; // end of storeController

})();
