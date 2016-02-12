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

var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        var vmUserReceiptData = this;

        function refresh() {
            //console.log("call refresh()");
            delete vmUserReceiptData.data;
        };

        function load() {
            if (vmUserReceiptData.data) {
                //console.log("return existing data");
                return Promise.resolve(vmUserReceiptData.data);
            }

            return new Promise(resolve => {
                //console.log("call backend API...");
                apiService
                .getUserResource()
                .then( function(resource) {
                    return resource.$get('allReceipts');
                })
                .then( function(receipts) {
                    vmUserReceiptData.data = receipts;
                    resolve(receipts);
                });

            });
        };


        function Group(key, receiptDate) {
            var vmgroup = this;

            vmgroup.key = key;
            vmgroup.receiptDate = new Date(receiptDate[0], receiptDate[1], receiptDate[2]);
            vmgroup.receipts = [];

            vmgroup.weekDay = days[vmgroup.receiptDate.getDay()];
            vmgroup.year = receiptDate[0];
            vmgroup.month = months[receiptDate[1]-1];
            vmgroup.day = receiptDate[2];

            vmgroup.addReceipt = function(receipt) {
                vmgroup.receipts.push(receipt);
            };
        };

        function getTimeline() {
            var groups = {};

            return load().then(data => {
                //console.log("load data", data);
                if (data.length === 0) {
                    return groups;
                }
                data.forEach( receipt => {
                    var key = receipt.receiptDate.join('_');

                    var group = groups[key];
                    if (group === undefined) {
                        group = new Group(key, receipt.receiptDate);
                        groups[key] = group;
                    }
                    group.addReceipt(receipt);
                });
                return groups;
            });
        };

// --- old code ----
        function Receipt(receiptResource) {
            this.resource = receiptResource;
            this.waiting = (receiptResource.status === 'WAIT_FOR_RESULT');
            this.loaded = (receiptResource.status === 'HAS_RESULT');
            this.receiptDate = receiptResource.receiptDate.join('-');
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
                        return Promise.reject("NO receipts!");
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

        return {
            'getTimeline' : getTimeline,
            'refresh' : refresh,
            'loadFirstPage' : loadFirstPage,
            'hasNextPage' : hasNextPage,
            'loadNextPage' : loadNextPage,
            'loadReceiptById' : loadReceiptById
        };

    }; // end of UserReceiptData
})();
