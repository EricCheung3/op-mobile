(function () {
'use strict';

    angular
        .module('openpriceMobile')
        .factory('receiptService', receiptService);

    receiptService.$inject = ['$log', '$rootScope', 'apiService', '$q', 'halClient', '$http'];
    function receiptService(   $log,   $rootScope,   apiService ,  $q,   halClient ,  $http) {
        var imageCache = new Object();
        var storesCache = new Object();
        var storeItemsCache = new Object();
        var receiptCache = new Object();
        var receiptItemsCache = new Object();

        return {
            'getReceiptResource' : getReceiptResource,
            'getReceiptResource2' : getReceiptResource2,
            'getStoresResource' : getStoresResource,
            'loadFirstPageOfUserStores' : loadFirstPageOfUserStores,
            'loadFirstPageOfUserStoreItems' : loadFirstPageOfUserStoreItems,
            'loadUserStoreItemsMore' : loadUserStoreItemsMore,
            'loadFirstPageOfUserReceipts' : loadFirstPageOfUserReceipts,
            'getImageBase64Data' : getImageBase64Data
        };

        function getReceiptResource(receiptId) {
            var deferred = $q.defer();

            apiService
                .getUserResource()
                .then( function(userResource) {
                    return userResource.$get('receipt', {'receiptId': receiptId});
                })
                .then( function(receipt) {
                    // add 'path' property to each image
                    receipt.images.forEach( function(image) {
                        getImageBase64Data(image._links.base64.href)
                        .then( function(imageData) {
                            image.path = imageData;
                        });
                    });
                    // use resolve to wait all the call-back done
                    deferred.resolve(receipt);
                });

            return deferred.promise;
        };

        function getReceiptResource2(receiptId, callback) {
            var receiptParseResult;
            var receipt;
            if(receiptItemsCache[receiptId]!=null && receiptCache.rating!=null){
                console.log("read from cache");
                callback(receiptCache, receiptItemsCache[receiptId]);
            }else {
              getReceiptResource(receiptId)
                .then(function(receipt) {
                    // console.log("receipt rating", receipt.rating);
                    receiptCache = receipt;
                    receipt.$get('result').then(function(receiptResult){
                        receiptParseResult = receiptResult;
                        receiptItemsCache[receiptId]  = receiptResult.items;
                        console.log("getReceiptResource2 ", receiptResult);
                    })
                    .catch ( function(err){
                        console.error('ERROR code', err); // TODO handle error
                    })
                    .finally( function() {
                        callback(receiptCache, receiptParseResult);
                    });
                });
          }
        };

        function loadFirstPageOfUserReceipts(callback) {
            var resultReceipts = [];
            var receiptListPage;
            return apiService
                .getUserResource()
                .then( function(resource) {
                    return resource.$get('receipts');
                })
                .then( function(receiptList) {
                    receiptListPage = receiptList;
                    if(receiptList.$has('receipts')){
                        return receiptList.$get('receipts');
                    } else {
                        return $q.reject("NO receipts!");
                    }
                })
                .then( function(receipts) {
                    receipts.forEach( function(receipt) {
                        resultReceipts.push(receipt);
                        getImageBase64Data(receipt.images[0]._links.base64.href)
                        .then( function(imageData) {
                            receipt.path = imageData;
                        });
                    });
                })
                .catch ( function(err){
                    console.error('ERROR code', err); // TODO handle error
                })
                .finally( function() {
                    callback(resultReceipts, receiptListPage);
                });
        };

         // get image base64 data according to the download url
        function getImageBase64Data(downloadUrl) {
            var deferred = $q.defer();
            var imageData = imageCache[downloadUrl];
            if (imageData) {
                //console.log("Get image data from cache for "+downloadUrl);
                deferred.resolve(imageData);
            } else {
                $http
                .get(downloadUrl)
                .then( function(base64) {
                    imageData = "data:image/jpeg;base64,"+ base64.data;
                    imageCache[downloadUrl] = imageData;
                    //console.log("Download image data from server for "+downloadUrl);
                    deferred.resolve(imageData);
                }, function(err) {
                    console.log("ERROR",err); // TODO handle error
                });
            }

            return deferred.promise;
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
            var categroy=new Object();
            var deferred = $q.defer();
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

                        items.forEach(function (item) {
                          console.log("1...item",item);
                            categroy[item.catalogCode] = []; //NOTE: catalogCode should be labelCodes
                        });
                        return items,categroy;
                    }).then(function(categroy,items){
                      // vm.categroy
                      console.log("2...item",storeItems);
                      console.log("3...categroy",categroy);
                      storeItems.forEach(function (item) {
                          //NOTE: catalogCode should be labelCodes
                          categroy[item.catalogCode].push({"name":item.name});
                          // vm.categroy[item.labelCodes].push({
                          //     "name": item.displayName,
                          //     "price": item.displayPrice
                          // }); //NOTE: need price in shoping list
                          // console.log("category", category);
                      });


                    })
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

    }; // end of receiptService
})();
