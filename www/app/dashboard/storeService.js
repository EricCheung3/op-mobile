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
            'loadFirstPageOfUserStoreItems' : loadFirstPageOfUserStoreItems,
            'loadUserStoreItemsMore' : loadUserStoreItemsMore
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
                                  console.log("shoppingStores", storeResource);
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
                  })
                  .then( function(storeList) {
                      storePage = storeList;
                      console.log("storeList",storeList);
                      if(storeList.$has('shoppingStores')){
                          return storeList.$get('shoppingStores');
                      } else {
                          return $q.reject("NO stores!");
                      }
                  })
                  .then( function(stores) {
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

          function loadFirstPageOfUserStoreItems(storeId, callback) {
              var storeItems = [];
              var itemsPage;
              var category=new Object();

              return apiService
                  .getUserResource()
                  .then(function (userResource) {
                      userResource.$get('store',{'storeId': storeId})
                      .then(function(store) {
                          return store.$get('items');
                      })
                      .then(function(itemsResource) {
                          itemsPage = itemsResource;
                          if (itemsResource.$has('shoppingItems')) {
                              return itemsResource.$get('shoppingItems');
                          }else {
                              console.log("NO Items yet!");
                              return $q.reject("NO Items yet!");
                          }
                      }) // return after $get(shoppingItems)
                      .then(function(items){
                          storeItems = items;
                          storeItemsCache[storeId] = items;
                          storeItemsCache.page = itemsPage;

                      })// NOTE: Good, category can be created at here

                      .catch ( function(err){
                          console.error('ERROR code', err); // TODO handle error
                      })
                      .finally( function() {
                          callback(storeItems, itemsPage);
                      });
                  });

          };

          //FIXME: cache has a little bug
          function loadUserStoreItemsMore(storeId, callback) {
              var storeItems = [];
              var itemsPage;
              var deferred = $q.defer();
              var cache = storeItemsCache[storeId];

              if(cache){
                  console.log("read items from itemsCache");
                  console.log("cache", storeItemsCache[storeId]);
                  deferred.resolve(storeItemsCache);
                  callback(storeItemsCache[storeId], storeItemsCache.page);
              }else {
                apiService
                    .getUserResource()
                    .then(function (userResource) {
                        userResource.$get('store',{'storeId': storeId})
                        .then(function(store) {
                            return store.$get('items');
                        })
                        .then(function(itemsResource) {
                            itemsPage = itemsResource;
                            if (itemsResource.$has('shoppingItems')) {
                                return itemsResource.$get('shoppingItems');
                            }else {
                                console.log("NO Items yet!");
                                return $q.reject("NO Items yet!");
                            }
                        }) // return after $get(shoppingItems)
                        .then(function(items){
                            storeItems = items;
                            storeItemsCache[storeId] = items;
                            storeItemsCache.page = itemsPage;
                            deferred.resolve(storeItemsCache);
                        })
                        .catch ( function(err){
                            console.error('ERROR code', err); // TODO handle error
                        })
                        .finally( function() {
                            callback(storeItems, itemsPage);
                        });
                    });
              }
              return deferred.promise;
          };

      }


})();
