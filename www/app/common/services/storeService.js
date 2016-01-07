(function () {
    'use strict';

    angular
        .module('openprice.mobile')
        .factory('storeService', storeService);

    storeService.$inject = ['$rootScope', '$q', 'apiService'];
    function storeService (  $rootScope,   $q,   apiService) {

        var storesCache = new Object();
        var storeItemsCache = new Object();

        return {
            'loadFirstPageOfUserStores' : loadFirstPageOfUserStores,
            'getStoreAllItems' : getStoreAllItems
        };

        function loadFirstPageOfUserStores(callback){
              var storeList = [];
              var storePage;
              return apiService
                .getUserResource()
                .then( function(resource) {
                    return resource.$get('stores');
                }).then( function(storeList) {
                    storePage = storeList;
                    console.log("storeList",storeList);
                    if(storeList.$has('shoppingStores')){
                        return storeList.$get('shoppingStores');
                    } else {
                        return $q.reject("NO stores!");
                    }
                }).then( function(stores) {
                    stores.forEach( function(store) {
                        storeList.push(store);
                    });
                })
                .catch ( function(err){
                    console.error('ERROR code', err); // TODO handle error
                })
                .finally( function() {
                    callback(storeList, storePage);
                });

          };

          function getStoreAllItems(storeId, callback) {
              var resultStore;
              apiService
              .getUserResource()
              .then(function (userResource) {
                  userResource.$get('store',{'storeId': storeId})
                  .then(function(store) {
                      resultStore = store;
                      return store.$get('shoppingItems');
                  }).then(function (items) {
                      resultStore.items = items;
                  })
                  .catch ( function(err){
                      console.error('ERROR code', err); // TODO handle error
                  })
                  .finally( function() {
                      callback(resultStore);
                  });
              });
        };


    }
})();
