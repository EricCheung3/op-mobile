(function () {
    'use strict';

    angular
      .module('openpriceMobile')
      .factory('storeService', storeService);

      storeService.$inject = ['$rootScope', '$q', 'apiService'];
      function storeService (  $rootScope,   $q,   apiService) {

          var storesCache = new Object();
          var storeItemsCache = new Object();

          return {
            'getStoresResource' : getStoresResource,
            'loadFirstPageOfUserStores' : loadFirstPageOfUserStores,
            'getStoreAllItems' : getStoreAllItems
          };


          function getStoresResource(){
              var stores = [];
              var deferred = $q.defer();
              if(storesCache.length > 0){
                  console.log("read store from storesCache");
                  deferred.resolve(storesCache);
              }else{
                  apiService
                  .getUserResource()
                  .then(function (userResource) {
                      userResource.$get('stores')
                      .then(function(storeResource){
                          console.log("getStoresResource", storeResource);
                          if (storeResource.$has('shoppingStores')) {
                              return storeResource.$get('shoppingStores');
                          }else {
                              return $q.reject("NO Stores yet!");
                          }
                      })
                      .then(function(storeList){
                          stores.push(storeList);
                          storesCache = storeList;
                          deferred.resolve(storesCache);
                      });
                  });
              }

              return deferred.promise;
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
              var storeItems = [];

              return apiService
                .getUserResource()
                .then(function (userResource) {
                    userResource.$get('store',{'storeId': storeId})
                    .then(function(store) {
                        return store.items;
                    }).then(function(items){
                        storeItems = items;
                    })
                    .catch ( function(err){
                        console.error('ERROR code', err); // TODO handle error
                    })
                    .finally( function() {
                        callback(storeItems);
                    });
                });
          }

      }
})();