(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('StoreListController', StoreListController);

    StoreListController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService' , '$state', 'UserShoppingData', '$ionicPopup'];

    function StoreListController(   $log,   $rootScope,   $scope,   $location,   apiService ,   $state ,  UserShoppingData,   $ionicPopup) {
        $log.debug('==> StoreListController');

        var vm = this;
        vm.stores = [];
        vm.pullToRefresh = pullToRefresh;
        vm.showShoppingStore = showShoppingStore;
        vm.deleteStore = deleteStore;
        vm.searchStoresFromServer = searchStoresFromServer;
        vm.itemsClicked = itemsClicked;
        vm.cancelSearch = cancelSearch;

        vm.searchStores = false;

        UserShoppingData
        .loadFirstPage()
        .then( function(stores) {
            console.log('init : ', stores);
            if(UserShoppingData.hasNextPage()){
                UserShoppingData
                .loadNextPage()
                .then(function (stores) {
                  console.log('next : ', stores);
                  $scope.$apply(function () {
                    vm.stores = stores;
                  });
                });
            }else {
                $scope.$apply(function () {
                  vm.stores = stores;
                });
            }
        });

        function pullToRefresh(){
            $log.debug('==> StoreListController.pullToRefresh');
            UserShoppingData
            .loadFirstPage()
            .then( function(stores) {
              $scope.$apply(function () {
                vm.stores = stores;
              });
            });
        }

        function showShoppingStore(store){
          UserShoppingData
          .loadShoppingStoreById(store.resource.id)
          .then(function (shoppingStore) {
              console.log(shoppingStore);
          });
            $state.go('app.dashboard.store',{storeId:store.resource.id});
        };

        function deleteStore(store){
            UserShoppingData
            .loadShoppingStoreById(store.resource.id)
            .then(function (shoppingStore) {
                if(shoppingStore.items.length !== 0){
                    var popup = $ionicPopup.show({
                      title: 'Delete Store',
                      scope: $scope,
                      template: '<p>If you delete the store, the shopping list of this store, which currently has ' + shoppingStore.items.length + ' item(s), will be deleted.</p>',
                      buttons: [
                          { text: 'Delete' ,
                            type: 'button-positive',
                            onTap: function(e) {
                                store.resource.$del('self');
                                var index = vm.stores.indexOf(store);
                                if (index > -1) {
                                    vm.stores.splice(index, 1);
                                }
                            }
                          },
                          { text: 'Cancel',
                            type: 'button-positive',
                            onTap: function(e) {
                                popup.close();
                            }
                          }
                      ]
                  });
                }else {
                    store.resource.$del('self');
                    var index = vm.stores.indexOf(store);
                    if (index > -1) {
                        vm.stores.splice(index, 1);
                    }
                }
            });

        };

        function searchStoresFromServer (query) {
            vm.searchStores = true;
            if (query && query !== '') {
                return new Promise( function(resolve) {
                    UserShoppingData
                    .storeList(query)
                    .then(function (stores) {
                        /* //FIXME: now we only allow user to add stores which existed in our database
                        if (stores.length === 0) {
                            resolve({stores: [{'name':query, 'code':query.replace(/ /g,'').toLowerCase()}]});
                        } else {
                            resolve({stores: stores});
                        }
                        */
                        resolve({stores: stores});
                    });
                });
            }
            vm.externalModel = [];
            return [];
        };
        function itemsClicked(callback) {
            var store = {
                  chainCode: callback.item.code,
                  items: []
            };
            apiService
            .getUserResource()
            .then(function (userResource) {
                userResource.$post('shoppingList', {}, store)
                .then( function(storeLink) {
                    pullToRefresh();
                });
            });
            vm.searchStores = false;
            vm.externalModel = [];
        };

        function cancelSearch(callback) {
            vm.searchStores = false;
            vm.externalModel = [];
        };


    }; // end of StoreListController

})();
