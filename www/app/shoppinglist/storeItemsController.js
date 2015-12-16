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
            vm.items = store.items;
            categorizeItems(store.items, 0);
        });


        function categorizeItems(items, flag){
            $scope.totalNumber = items.length;
            // click to display detail
            items.forEach(function (item) {
                // item.catalog.labelCodes="Fruit, Food", extract the first category
                if(item.catalog !== null){
                  if (flag==0){
                      vm.show[item.catalog.labelCodes.split(",")[0]] = true;

                      vm.number[item.catalog.name] = 1;
                      vm.price[item.catalog.name] = item.catalog.price; // need to make sure
                      vm.show[item.name] = false;
                      $scope.totalPrice = Number($scope.totalPrice) + Number(vm.price[item.catalog.name]);
                    }
                      $scope.category[item.catalog.labelCodes.split(",")[0]] = [];
                      $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = 0;


                }else {
                  if (flag==0){
                      vm.show["noCategory"] = true;

                      vm.number[item.name] = 1;
                      vm.price[item.name] = 0; // need to make sure
                      vm.show[item.name] = false;
                      $scope.totalPrice = Number($scope.totalPrice) + Number(vm.price[item.name]);
                    }
                      $scope.category["noCategory"] = [];
                      $scope.subtotal["noCategory"] = 0;

                }

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
                    $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = Number($scope.subtotal[item.catalog.labelCodes.split(",")[0]]) + Number(vm.price[item.catalog.name]);
                }

            });

            console.log("category", $scope.category);

        };


        function editItem(index){
            console.log("edit item test");
            // need server API supporting
            // vm.items[index].$put(...)
        };

        function deleteItem(index,item){

            $scope.totalNumber = $scope.totalNumber - 1;


            if(item.catalog === null){
                $scope.totalPrice = Number($scope.totalPrice) - Number(vm.price[item.name]);
                $scope.category["noCategory"][index].$del('self');
                $scope.category["noCategory"].splice(index,1);
                // $scope.subtotal["noCategory"] = Number($scope.subtotal["noCategory"]) - 0;
                if($scope.category["noCategory"].length == 0){
                    delete $scope.category["noCategory"];
                }
            }else {
              $scope.totalPrice = Number($scope.totalPrice) - Number(vm.price[item.catalog.name]);
                $scope.category[item.catalog.labelCodes.split(",")[0]][index].$del('self');
                $scope.category[item.catalog.labelCodes.split(",")[0]].splice(index,1);
                $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = Number($scope.subtotal[item.catalog.labelCodes.split(",")[0]]) - Number(item.catalog.price)*Number(vm.number[item.catalog.name]);
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

          if (item.catalog === null) {
            vm.number[item.name] = vm.number[item.name] + 1;
            vm.price[item.name] = 0;
          }else {
            vm.number[item.catalog.name] = vm.number[item.catalog.name] + 1;
            vm.price[item.catalog.name] = Number(vm.price[item.catalog.name]) + Number(item.catalog.price);
            $scope.totalPrice = Number($scope.totalPrice) + Number(item.catalog.price);
            $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = Number($scope.subtotal[item.catalog.labelCodes.split(",")[0]]) + Number(item.catalog.price);
          }

        };

        function minusItemNumber(item){

              if(item.catalog !== null){
                if(vm.number[item.catalog.name] > 1){
                  vm.number[item.catalog.name] = vm.number[item.catalog.name] - 1;
                  vm.price[item.catalog.name] = Number(vm.price[item.catalog.name]) - Number(item.catalog.price);
                  $scope.totalPrice = $scope.totalPrice - Number(item.catalog.price);
                  $scope.subtotal[item.catalog.labelCodes.split(",")[0]] = Number($scope.subtotal[item.catalog.labelCodes.split(",")[0]]) - Number(item.catalog.price);
                }
              }else {
                if(vm.number[item.name] > 1){
                  vm.number[item.name] = vm.number[item.name] - 1;
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
        };

        function addToShoppingList(items){
            console.log("=======>addToShoppingList");
            // add array to shoppinglist after click Done button
            items.forEach(function(item){

              if(item.labelCodes!==undefined ){
                // add check for new category...
                if(!$scope.category[item.labelCodes.split(",")[0]]){
                    $scope.category[item.labelCodes.split(",")[0]] = [];
                    $scope.subtotal[item.labelCodes.split(",")[0]] = 0;
                }
                vm.show[item.labelCodes.split(",")[0]] = true;
                /** add items to category [used to display and refresh UI]*/
                // if item in shoppinglist already
                if(arrayContainsObj($scope.category[item.labelCodes.split(",")[0]], item)){
                    vm.number[item.name] = vm.number[item.name] + 1;
                    vm.price[item.name] = Number(vm.price[item.name]) + Number(item.price);
                    $scope.subtotal[item.labelCodes.split(",")[0]] = Number($scope.subtotal[item.labelCodes.split(",")[0]]) + Number(item.price);
                    $scope.totalPrice = Number($scope.totalPrice) + Number(item.price);
                }else {
                    $scope.totalNumber = $scope.totalNumber + 1;

                    vm.show[item.labelCodes.split(",")[0]] = true;
                    vm.number[item.name] = 1;
                    vm.price[item.name] = item.price; // need to make sure
                    vm.show[item.name] = false;
                    //NOTE: catalogCode should be labelCodes
                    if (item.code === null){
                        $scope.category["noCategory"].push(item);
                        $scope.subtotal["noCategory"] = Number($scope.subtotal["noCategory"]) + 0;
                    }else {
                        $scope.category[item.labelCodes.split(",")[0]].push(item);
                        $scope.subtotal[item.labelCodes.split(",")[0]] = Number($scope.subtotal[item.labelCodes.split(",")[0]]) + Number(vm.price[item.name]);
                        $scope.totalPrice = Number($scope.totalPrice) + Number(vm.price[item.name]);
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
                            .then(function () {
                                pullToRefresh();
                            })
                            console.log("result", userStore);
                        })
                    });
                }
              }else { // item is not in catalog
                console.log("item is not in catalog!!!");

                // check noCategory existed or not
                if ($scope.category["noCategory"] == undefined){
                    vm.show["noCategory"] = true;

                    vm.number[item.naturalName] = 1;
                    vm.price[item.naturalName] = 0; // need to make sure
                    vm.show[item.naturalName] = false;
                    // $scope.totalPrice = Number($scope.totalPrice) + Number(vm.price[item.name]);
                    $scope.category["noCategory"] = [];
                    $scope.subtotal["noCategory"] = 0;
                    $scope.category["noCategory"].push(item);
                    $scope.subtotal["noCategory"] = Number($scope.subtotal["noCategory"]) + 0;
                // check item existed or not
                }else if (!arrayContainsObj($scope.category["noCategory"], item)){
                    console.log("item exist");
                    vm.number[item.naturalName] = vm.number[item.naturalName] + 1;
                }else {
                  var object =
                      {
                        "catalogCode" : null, //item.catalogCode
                        "name" : item.naturalName
                       };
                  console.log("added items obect", object);

                  // post to database
                  apiService.getUserResource()
                  .then(function (userResource) {
                      userResource.$get('store', {storeId:storeId})
                      .then(function(userStore){
                          userStore.$post('items', {}, object)
                          .then(function () {
                              pullToRefresh();
                          })
                          console.log("result", userStore);
                      })
                  });
                }



              }
            });
        };

        function pullToRefresh() {
            console.log("=========> pull to refresh");
            storeService.getStoreAllItems(storeId, function(store) {
                vm.items = store.items;
                console.log("=====>refresh vm.items", vm.items);
                categorizeItems(store.items, 1);
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        //  most concise and efficient way to find out if a JavaScript array contains an obj use underscore.js
        function arrayContainsObj(arr, obj){
          for(var i=0; i<arr.length; i++) {

            if(arr[i].catalog !== null && (arr[i].catalog.id == obj.id)){
                return true;
            }else {
              if (arr[i].naturalName == obj.naturalName)
                return true;  
            }
          }
        }
    }; // end of storeController

})();
