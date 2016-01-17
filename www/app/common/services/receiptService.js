(function () {
'use strict';

    angular
        .module('openprice.mobile')
        .factory('receiptService', receiptService);

    receiptService.$inject = ['$log', '$rootScope', 'apiService', '$q', 'halClient', '$http'];
    function receiptService(   $log,   $rootScope,   apiService ,  $q,   halClient ,  $http) {
        var imageCache = new Object();
        var receiptCache = new Object();
        var receiptParseResultCache = new Object();

        return {
            'loadReceipt' : loadReceipt,
            'loadFirstPageOfUserReceipts' : loadFirstPageOfUserReceipts,
            'loadMoreReceipts' : loadMoreReceipts,
            'getImageBase64Data' : getImageBase64Data
        };

        function loadReceipt(receiptId) {
            var deferred = $q.defer();
            apiService
            .getUserResource()
            .then( function(userResource) {
                return userResource.$get('receipt', {'receiptId': receiptId});
            })
            .then( function(receipt) {
                receipt.$get('receiptImages')
                .then( function(images){
                    receipt.images = images;
                    images.forEach( function(image) {
                        getImageBase64Data(image.base64Url)
                        .then( function(imageData){
                            image.path = imageData;
                        });
                    });
                });
                receipt.$get('result')
                .then( function(result){
                    receipt.result = result;
                    receipt.result.$get('receiptItems')
                    .then( function(receiptItems){
                        receipt.result.items = receiptItems;
                    });
                });

                deferred.resolve(receipt);
            });
            return deferred.promise;
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
                }).then( function(receipts) {
                    receipts.forEach( function(receipt) {
                        resultReceipts.push(receipt);
                        receipt.$get('receiptImages')
                        .then( function(images){
                            getImageBase64Data(images[0].base64Url)
                            .then( function(imageData){
                                receipt.path = imageData;
                            });
                        });
                        receipt.$get('result')
                        .then( function(result){
                            receipt.result = result;
                            receipt.result.$get('receiptItems')
                            .then( function(receiptItems){
                                receipt.result.items = receiptItems;
                            });
                        });
                    });
                }).catch ( function(err){
                    console.error('ERROR code', err); // TODO handle error
                }).finally( function() {
                    callback(resultReceipts, receiptListPage);
                });
        };

        function loadMoreReceipts(receipts, lastReceiptListPage, callback){
            console.log('==>scrollToLoadMore');
            var vmreceipts = receipts;
            var vmlastReceiptListPage = lastReceiptListPage;

            vmlastReceiptListPage.$get('next')
            .then( function(nextReceiptsList) {
                vmlastReceiptListPage = nextReceiptsList;
                return nextReceiptsList.$get('receipts');
            })
            .then( function(receipts) {
                receipts.forEach( function(receipt) {
                    vmreceipts.push(receipt);
                    receipt.$get('receiptImages')
                    .then( function(images){
                        getImageBase64Data(images[0].base64Url)
                        .then( function(imageData){
                            receipt.path = imageData;
                        });
                    });

                });
            }).finally(function() {
                callback(vmreceipts, vmlastReceiptListPage);
            });

        };


         // get image base64 data according to the download url
        function getImageBase64Data(downloadUrl) {
            var deferred = $q.defer();
            var imageData = imageCache[downloadUrl];
            if (imageData) {
                console.log("Get image data from cache");
                deferred.resolve(imageData);
            } else {
                $http
                .get(downloadUrl)
                .then( function(base64) {
                    imageData = "data:image/jpeg;base64,"+ base64.data;
                    imageCache[downloadUrl] = imageData;
                    deferred.resolve(imageData);
                }, function(err) {
                    console.log("ERROR",err); // TODO handle error
                });
            }

            return deferred.promise;
        };


    }; // end of receiptService
})();
