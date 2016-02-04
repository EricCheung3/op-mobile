(function () {
'use strict';

    angular
        .module('openprice.mobile')
        .factory('UserReceiptData', UserReceiptData);

    UserReceiptData.$inject = ['$log', '$http', 'apiService'];
    function UserReceiptData(   $log,   $http,   apiService) {
        var imageCache = new Object();
        var userReceipts;
        var lastReceiptListPage;

        return {
            'getReceiptGroups' : getReceiptGroups,
            'loadFirstPage' : loadFirstPage,
            'hasNextPage' : hasNextPage,
            'loadNextPage' : loadNextPage,
            'loadReceiptById' : loadReceiptById
        };

        function Receipt(receiptResource) {
            this.resource = receiptResource;
            this.waiting = (receiptResource.status === 'WAIT_FOR_RESULT');
            this.loaded = (receiptResource.status === 'HAS_RESULT');
            this.receiptDate = receiptResource.receiptDate.join('-');
        };

        function getReceiptGroups() {

        };

        function loadFirstPage() {
            console.log('==>UserReceiptData.loadFirstPage()');
            userReceipts = [];
            return new Promise(resolve => {
                apiService
                .getUserResource()
                .then( function(resource) {
                    return resource.$get('receipts');
                })
                .then( function(receiptList) {
                    lastReceiptListPage = receiptList;
                    if (receiptList.$has('receipts')) {
                        return receiptList.$get('receipts');
                    } else {
                        return $q.reject("NO receipts!");
                    }
                }).then( function(receipts) {
                    if (receipts) {
                        receipts.forEach( function(receipt) {
                            userReceipts.push(new Receipt(receipt));
                        });
                    }
                    resolve(userReceipts);
                });
            });
        };

        function hasNextPage() {
            if (lastReceiptListPage) {
                return lastReceiptListPage.$has('next');
            }
            return false;
        };

        function loadNextPage() {
            console.log('==>UserReceiptData.loadNextPage()');
            return new Promise(resolve => {
                lastReceiptListPage
                .$get('next')
                .then( function(nextReceiptsList) {
                    console.log('get next page:', nextReceiptsList);
                    console.log('has next: ', nextReceiptsList.$has('next'));
                    lastReceiptListPage = nextReceiptsList;
                    return nextReceiptsList.$get('receipts');
                })
                .then( function(receipts) {
                    console.log('==>UserReceiptData.loadNextPage(), get next receipts:', receipts);
                    receipts.forEach( function(receipt) {
                        userReceipts.push(new Receipt(receipt));
                    });
                    resolve(userReceipts);
                });
            });
        };

        function loadReceiptById(receiptId) {
            return new Promise(resolve => {
                apiService
                .getUserResource()
                .then( function(userResource) {
                    return userResource.$get('receipt', {'receiptId': receiptId});
                })
                .then( function(receipt) {
                    receipt.$get('receiptImages')
                    .then( function(images) {
                        receipt.images = images;
                        images.forEach( function(image) {
                            getImageBase64Data(image.base64Url)
                            .then( function(imageData){
                                image.path = imageData;
                            });
                        });
                    });
                    receipt.$get('receiptItems')
                    .then( function(items) {
                        receipt.items = items;
                    });
                    resolve(receipt);
                });

            });
        };

        function getImageBase64Data(downloadUrl) {
            var imageData = imageCache[downloadUrl];
            if (imageData) {
                console.log("Get image data from cache");
                return Promise.resolve(imageData);
            }

            return new Promise(resolve => {
                $http
                .get(downloadUrl)
                .then( function(base64) {
                    imageData = "data:image/jpeg;base64,"+ base64.data;
                    imageCache[downloadUrl] = imageData;
                    resolve(imageData);
                }, function(err) {
                    console.log("ERROR",err); // TODO handle error
                });
            });
        };

    }; // end of UserReceiptData
})();
