(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('storeItemsController', storeItemsController);

    storeItemsController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', '$stateParams', 'storeService', '$ionicPopup', '$state', 'searchService'];

    function storeItemsController(   $log,   $rootScope,   $scope,   $location,   apiService ,  $stateParams ,  storeService ,  $ionicPopup ,  $state,   searchService) {
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

        storeService.getStoreAllItems(storeId, function(store){
            vm.store = store;
            // vm.items = store.$get('items');
            vm.items = store.items;
            console.log("store",store);
            console.log("items",store.items);
            categorizeItems(store.items);
        });


        function categorizeItems(items){
            $scope.totalNumber = items.length;
            // click to display detail
            items.forEach(function (item) {
                // item.catalog.labelCodes="Fruit, Food", extract the first category
                if(item.catalog !== null){
                  vm.show[item.catalog.labelCodes.split(",")[0]] = false;
                  vm.number[item.name] = 1;
                  vm.price[item.name] = item.catalog.price; // need to make sure
                  vm.show[item.name] = false;
                  $scope.category[item.catalog.labelCodes.split(",")[0]] = [];
                  $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = 0;
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
            items.forEach(function (item) {
                vm.show[item.name] = false;
                //NOTE: catalogCode should be labelCodes
                if (item.catalog === null){

                    $scope.category["noCategory"].push(item);
                    $scope.subtotal["noCategory"] = Number($scope.subtotal["noCategory"]) + 0;
                }else {
                    $scope.category[item.catalog.labelCodes.split(",")[0]].push(item);
                    $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = Number($scope.subtotal[item.catalog.labelCodes.split(",")[0]]) + Number(vm.price[item.name]);
                }

            });
            console.log("category", $scope.category);

        };


        function pullToRefresh() {
            console.log("=========> pull to refresh");
            // load first page of items
            storeService.getStoreAllItems(storeId, function(store) {
                vm.items = store.items.$$state.value;
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        function editItem(index){
            console.log("edit item test");
            // need server API supporting
            // vm.items[index].$put(...)
        };

        function deleteItem(index,item){

            $scope.totalNumber = $scope.totalNumber - 1;

            $scope.totalPrice = Number($scope.totalPrice) - Number(vm.price[item.name]);
            if(item.catalog === null){
                $scope.category["noCategory"][index].$del('self');
                $scope.category["noCategory"].splice(index,1);
                // $scope.subtotal["noCategory"] = Number($scope.subtotal["noCategory"]) - 0;
                if($scope.category["noCategory"].length == 0){
                    delete $scope.category["noCategory"];
                }
            }else {
                $scope.category[item.catalog.labelCodes.split(",")[0]][index].$del('self');
                $scope.category[item.catalog.labelCodes.split(",")[0]].splice(index,1);
                $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = Number($scope.subtotal[item.catalog.labelCodes.split(",")[0]]) - Number(item.catalog.price)*Number(vm.number[item.name]);
                if($scope.category[item.catalog.labelCodes.split(",")[0]].length == 0){
                    delete $scope.category[item.catalog.labelCodes.split(",")[0]];
                }
            }
        };

        function itemDetail(item) {
            vm.show[item.name] = !vm.show[item.name];
        };

        function categoryDetail(categoryLabel){
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
            $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = Number($scope.subtotal[item.catalog.labelCodes.split(",")[0]]) + Number(item.catalog.price);
          }

        };

        function minusItemNumber(item){
            if(vm.number[item.name] > 1){
              vm.number[item.name] = vm.number[item.name] - 1;
              if(item.catalog !== null){
                vm.price[item.name] = Number(vm.price[item.name]) - Number(item.catalog.price);
                $scope.totalPrice = $scope.totalPrice - Number(item.catalog.price);
                $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = Number($scope.subtotal[item.catalog.labelCodes.split(",")[0]]) - Number(item.catalog.price);
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
            // addToShoppingList(callback.item);
        };
        function itemsRemoved(callback) {
            console.log('callback',callback);
        };
        function doneSearch(callback) {
            console.log("Done",callback); // this will return an array
            // add selected items to shopping list
            addToShoppingList(callback.selectedItems);
            // auto refresh shopping list
            pullToRefresh();
        }


        function addToShoppingList(items){
            console.log("=======>addToShoppingList");

            /* // add item to shoppinglist after click an item
            var object = {
                          "catalogCode" : items.code, //item.catalogCode
                          "name" : items.naturalName
                         };
            console.log("added items obect", object);
            // post to database
            apiService.getUserResource()
            .then(function (userResource) {
                userResource.$get('store', {storeId:storeId})
                .then(function(userStore){
                    userStore.$post('items', {}, object)
                    console.log("result", userStore);
                })
            });
            */
            // add array to shoppinglist after click Done button
            items.forEach(function(item){
                $scope.totalNumber = $scope.totalNumber + 1;
                // add items to category [used to display and refresh UI]

                vm.show[item.labelCodes.split(",")[0]] = false;
                vm.number[item.name] = 1;
                vm.price[item.name] = item.price; // need to make sure
                vm.show[item.name] = false;
                //NOTE: catalogCode should be labelCodes
                if (item.code === null){
                    $scope.category["noCategory"].push(item);
                    $scope.subtotal["noCategory"] = Number($scope.subtotal["noCategory"]) + 0;
                }else {
                    // add check for new category...
                    if(!$scope.category[item.labelCodes.split(",")[0]]){
                        $scope.category[item.labelCodes.split(",")[0]] = [];
                        $scope.subtotal[item.labelCodes.split(",")[0]] = 0;

                    }
                    $scope.category[item.labelCodes.split(",")[0]].push(item);
                    $scope.subtotal[item.labelCodes.split(",")[0]] = Number($scope.subtotal[item.labelCodes.split(",")[0]]) + Number(vm.price[item.name]);
                }

                // [add to use's shopping list [database]]
                var object =
                    {
                      "catalogCode" : item.code, //item.catalogCode
                      "name" : item.naturalName
                     };
                console.log("added items obect", object);
                // post to database
                apiService.getUserResource()
                .then(function (userResource) {
                    userResource.$get('store', {storeId:storeId})
                    .then(function(userStore){
                        userStore.$post('items', {}, object)
                        console.log("result", userStore);
                    })
                });
            });


        };



    }; // end of storeController

})();
