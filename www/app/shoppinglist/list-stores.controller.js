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
        vm.addNewStore = addNewStore;

        UserShoppingData
        .loadFirstPage()
        .then( function(stores) {
            console.log('init : ', stores);
            $scope.$apply(function () {
              vm.stores = stores;
            });

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
            $state.go('app.dashboard.store',{storeId:store.resource.id});
        };

        function deleteStore(store){
            store.resource.$del('self');
            var index = vm.stores.indexOf(store);
            if (index > -1) {
                vm.stores.splice(index, 1);
            }
        };

        //FIXME: here is a hack to add shopping list store
        function addNewStore(){
            console.log("add new store at here");
            $scope.store = {};
            var popup = $ionicPopup.show({
                title: 'Add your favourate Store',
                // subTitle: 'Please input item name and price',
                scope: $scope,
                template: '<input type="text" ng-model="store.chainCode">',
                buttons: [
                    {
                      text: 'Cancel' ,
                      onTap: function(e) {
                          popup.close();
                      }
                    },
                    { text: 'OK',
                      type: 'button-positive',
                      onTap: function(e) {
                        // if($scope.store.chainCode)
                        return $scope.store.chainCode.replace(/ /g,'');
                      }
                    }
                ]
            });

            popup.then(function (chainCode) {
                var store = {};
                if(vm.defaultStoreListChainCode.indexOf(chainCode)!==-1){
                  store.chainCode = chainCode.toLowerCase();
                  store.items = [];
                  apiService
                  .getUserResource()
                  .then(function (userResource) {
                      userResource.$post('shoppingList', {}, store)
                      .then(function (storeLink) {
                        // refresh store list
                          pullToRefresh();
                      });
                  });
                }else {
                    console.log("no this store chainCode!");
                    var popup = $ionicPopup.show({
                        title: 'Sorry we do not support this store',
                        // subTitle: 'Please input item name and price',
                        scope: $scope,
                        template: '<div>We are so sorry that our app does not support this store right now, please send feedback to us, we will fix ASAP!</div>',
                        buttons: [
                            {
                              text: 'OK' ,
                              type: 'button-positive',
                              onTap: function(e) {
                                  popup.close();
                              }
                            }
                          ]
                    });
                }

            });

        };

        vm.defaultStoreListChainCode =
        [
          "costco",
          "dollarama",
          "dollaratree",
          "edojapan",
          "ikea",
          "londondrugs",
          "lucky97",
          "mcdonald",
          "newyorkfries",
          "nofrills",
          "petrocanada",
          "olanetorganic",
          "rcss", //should change to superstore
          "rexall",
          "rona",
          "safeway",
          "sears",
          "shoppers",
          "sobeys",
          "superstore",
          "tandt",
          "target",
          "thaiexpress",
          "timhortons",
          "toysrus",
          "walmart"
        ];


    }; // end of StoreListController

})();
