(function () {
'use strict';

    angular
        .module('openpriceMobile')
        .factory('receiptService', receiptService);

    receiptService.$inject = ['$log', '$rootScope', 'apiService', '$q', 'halClient', '$http'];
    function receiptService(   $log,   $rootScope,   apiService ,  $q,   halClient ,  $http) {
        var imageCache = new Object();
        var receiptCache = new Object();
        var receiptParseResultCache = new Object();

        return {
            'getReceiptResource' : getReceiptResource,
            'getReceiptResource2' : getReceiptResource2,
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
            if(receiptParseResultCache[receiptId]!=null){
                console.log("read from cache");
                callback(receiptCache, receiptParseResultCache[receiptId]);
            }else {
              getReceiptResource(receiptId)
                .then(function(receipt) {
                    // console.log("receipt rating", receipt.rating);
                    receiptCache = receipt;
                    receipt.$get('result').then(function(receiptResult){
                        receiptParseResult = receiptResult;
                        receiptParseResultCache[receiptId]  = receiptResult;
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


    }; // end of receiptService
})();
