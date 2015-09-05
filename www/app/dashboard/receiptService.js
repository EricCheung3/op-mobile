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

        return {
            'getReceiptResource' : getReceiptResource,
            'getStoresResource' : getStoresResource,
            'getStoreItemsResource' : getStoreItemsResource,
            'loadFirstPageOfUserReceipts' : loadFirstPageOfUserReceipts,
            'getImageBase64Data' : getImageBase64Data
        };

        function getReceiptResource(receiptId) {
            var deferred = $q.defer();
            var receiptImages = [] ;
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
                            if (storeResource.$has('stores')) {
                                return storeResource.$get('stores');
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

        function getStoreItemsResource(storeId) {
            var storeItems = [];
            var deferred = $q.defer();

            if(storeItemsCache[storeId]){
                console.log("read items from itesCache");
                deferred.resolve(storeItemsCache[storeId]);
            }else {
                apiService.getUserResource()
                .then(function (userResource) {
                    userResource.$get('store',{'storeId': storeId})
                    .then(function(store) {
                        store.$get('items')
                        .then(function(itemsResource) {
                            if (itemsResource.$has('shoppingItems')) {
                                itemsResource.$get('shoppingItems')
                                .then(function(items){
                                    storeItems.push(items);
                                    storeItemsCache[storeId] = items;
                                    deferred.resolve(storeItemsCache[storeId]);
                                    // storeItems = items;
                                    // deferred.resolve(storeItems);
                                });
                            }else {
                                console.log("NO Items yet!");
                                return $q.reject("NO Items yet!");
                            }

                        });
                    });
                });
            }

            return deferred.promise;
        }

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

    }; // end of receiptService
})();
