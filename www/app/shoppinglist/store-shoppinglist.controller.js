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

    StoreShoppingListController.$inject = ['$log', '$rootScope', '$scope', 'apiService', '$stateParams', '$ionicPopup', '$state', 'UserShoppingData', 'ionicToast'];

    function StoreShoppingListController(   $log,   $rootScope,   $scope,   apiService ,  $stateParams ,  $ionicPopup ,  $state,   UserShoppingData,   ionicToast) {
        $log.debug('==> StoreShoppingListController');

        var vm = this;
        vm.categoryList;
        vm.categoryMap;

        vm.plusItemNumber = plusItemNumber;
        vm.minusItemNumber = minusItemNumber;
        vm.editItem = editItem;
        vm.deleteItem = deleteItem;

        vm.searchProductsFromServer = searchProductsFromServer;
        vm.itemsClicked = itemsClicked;
        vm.cancelSearch = cancelSearch;

        vm.shoppingMode = false; // whether in shopping
        vm.goShoppingMode = goShoppingMode;
        vm.doneShoppingMode = doneShoppingMode;
        vm.clearShoppingList = clearShoppingList;

        UserShoppingData
        .categoryList()
        .then( function(categories) {
            //console.log("categoryList", categories);
            vm.categoryList = categories;
            vm.store = new ShoppingStore($stateParams.storeId, UserShoppingData, vm.categoryList);
            vm.store.reload();
        });

        // ---------------------------------------------------------------------
        // public functions for UI

        function plusItemNumber(item) {
            item.number = Number(item.number) + 1;
            vm.store.updateShoppingItem(item, false);
            vm.store.calculateTotalSubtotal();
        };

        function minusItemNumber(item) {
            if (item.number > 1) {
                item.number = item.number - 1;
                vm.store.updateShoppingItem(item, false);
                vm.store.calculateTotalSubtotal();
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
                    vm.store.updateShoppingItem(item, reload);
                    vm.store.calculateTotalSubtotal();
                } else {
                    console.log('Input is illegal');
                }

             });

        };

        function deleteItem(item) {
            item.shoppingItem.$del('self')
            .then( function() {
                vm.store.reload();
            });
        };

        //---------- Search ----------
        // parameter must be named "query", see ion-autocomplete for detail
        function searchProductsFromServer(query) {
            // items should come from remote server
            if (query && query !== '') {
                return vm.store.searchItems(query);
            }
            vm.externalModel = []; // use to clear the selected items
            return [];
        };

        // parameter must be named "callback"
        function itemsClicked(callback) {
            var itemForm = {
                name : callback.item.naturalName,
                catalogCode : callback.item.catalogCode,
                number : 1
            };
            vm.store.createShoppingItem(itemForm);
            vm.externalModel = []; // use to clear the selected items
        };

        function cancelSearch(callback) {
            vm.externalModel = []; // use to clear the selected items
        };

        // ---------- Shopping Mode ----------
        function goShoppingMode(){
            if(vm.store.resource.items.length !== 0){
                vm.shoppingMode = !vm.shoppingMode;
            }else {
                // toast: no items
                ionicToast.show('You have no items in the shopping list.', 'middle', false, 1500);
            }
        };

        function doneShoppingMode(category){
            vm.shoppingMode = !vm.shoppingMode;
            var popup = $ionicPopup.show({
                title: 'Good Job! You can snap your receipt now!',
                scope: $scope,
                template: '<p>To keep our app free and most useful we would like to ask you to snap your receipt, which takes only 20 seconds. Do you want to snap your receipt now?</p>',
                buttons: [
                    { text: 'No',
                      type: 'button-positive',
                      onTap: function(e) {
                        // $state.go('app.dashboard.stores');
                        popup.close();
                      }
                    },
                    { text: 'Yes' ,
                      type: 'button-positive',
                      onTap: function(e) {
                          $state.go('app.dashboard.stores').
                          then(function (argument) {
                            $state.go('app.dashboard.snap');
                          });

                      }
                    }
                ]
            });

        };

        function clearShoppingList(){
            if(vm.store.resource.items.length !== 0){
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
                          vm.store.clearList();
                          popup.close();
                      }
                    }
                  ]
                });
            }else {
                //toast is better
                ionicToast.show('You have no items in the shopping list.', 'middle', false, 1500);
            }
        };

        // ---------------------------------------------------------------------
        // private functions

        function ShoppingStore(storeId, UserShoppingData, categoryList) {
            var vmstore = this;
            vmstore.storeId = storeId;
            vmstore.UserShoppingData = UserShoppingData;
            vmstore.categoryList = categoryList;
            vmstore.resource = null;
            vmstore.items = [];
            vmstore.categoryMap = {};
            vmstore.totalPrice = 0;
            vmstore.totalNumber = 0;

            vmstore.reload = function(focusItemId) {
                console.log('==>ShoppingStore.reload() for '+vmstore.storeId);
                var newCategoryMap = {};

                vmstore.UserShoppingData
                .loadShoppingStoreById(vmstore.storeId)
                .then( function(shoppingStore) {
                    // update UI after reload
                    $scope.$apply(function() {
                        vmstore.resource = shoppingStore;
                        vmstore.items = shoppingStore.items;
                        vmstore.items.forEach(function (shoppingItem) {
                            addShoppingItemToCategory(newCategoryMap, shoppingItem);
                        });
                        //console.log('after adding, categoryMap is :', newCategoryMap);
                        for (var code in newCategoryMap) {
                            if (typeof newCategoryMap[code] !== 'function') {
                                newCategoryMap[code].items.forEach( function(item){
                                    if (item.shoppingItem.id === focusItemId) {
                                        newCategoryMap[code].showDetail = true;
                                    }
                                });
                            }
                        };
                        vmstore.categoryMap = newCategoryMap;
                        vmstore.calculateTotalSubtotal();
                        vm.categoryMap = vm.store.categoryMap;
                    });
                });
            };

            function addShoppingItemToCategory(categoryMap, shoppingItem) {
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

                var category = categoryMap[item.code];
                if (category === undefined) {
                    category = {
                        code : item.code,
                        items : [],
                        showDetail : true,
                        subtotal : 0,
                    };
                    vmstore.categoryList.forEach( function(pc) {
                        if (pc.code === category.code) {
                            category.label = pc.label;
                        }
                    });

                    categoryMap[item.code] = category;
                    //console.log('create new category:', category);
                }
                item.category = category;
                category.items.push(item);
            };

            vmstore.calculateTotalSubtotal = function() {
                vmstore.totalPrice = 0;
                for (var key in vmstore.categoryMap) {
                    var category = vmstore.categoryMap[key];
                    category.subtotal = 0;
                    category.items.forEach( function(item){
                        category.subtotal = category.subtotal + Number(item.price) * item.number;
                    })
                    vmstore.totalPrice = vmstore.totalPrice + category.subtotal;
                }
                vmstore.totalNumber = vmstore.items.length;
            }

            vmstore.clearList = function() {
                vmstore.resource.$del('items')
                .then(function () {
                    vm.store.reload();
                });
            };

            vmstore.updateShoppingItem = function(item, reload) {
                var itemForm = {
                    name : item.name,
                    number : item.number,
                    categoryCode : item.code
                };
                item.shoppingItem.$put('self', {}, itemForm)
                .then( function() {
                    if (reload) {
                        vmstore.reload(item.shoppingItem.id);
                    }
                });
            };

            vmstore.searchItems = function(query) {
                return new Promise( function(resolve) {
                    vmstore
                    .resource
                    .$get('catalogs', {query:query})
                    .then( function(items) {
                        if (items.length === 0) {
                            resolve({items: [{'naturalName':query}]});
                        } else {
                            items.push({'naturalName':query});
                            resolve({items: items});
                        }
                    });
                });
            };

            vmstore.createShoppingItem = function(itemForm) {
                vmstore.resource
                .$post('items', {}, itemForm)
                .then( function(location){
                    var itemId = location.substring(location.lastIndexOf('/') + 1);
                    vmstore.reload(itemId);
                });
            };

        };

    }; // end of storeController

})();
