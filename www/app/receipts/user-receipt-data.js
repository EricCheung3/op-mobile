(function () {
'use strict';

    angular
        .module('openprice.mobile')
        .factory('UserReceiptData', UserReceiptData);

    UserReceiptData.$inject = ['$log', 'apiService'];
    function UserReceiptData(   $log,   apiService) {
        var userReceipts;
        var lastReceiptListPage;

        return {
            'getReceiptGroups' : getReceiptGroups,
            'loadFirstPage' : loadFirstPage,
            'hasNextPage' : hasNextPage,
            'loadNextPage' : loadNextPage
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
            userReceipts = [];
            return new Promise(resolve => {
                apiService
                .getUserResource()
                .then( function(resource) {
                    return resource.$get('receipts');
                })
                .then( function(receiptList) {
                    lastReceiptListPage = receiptList;
                    if(receiptList.$has('receipts')){
                        return receiptList.$get('receipts');
                    }
                }).then( function(receipts) {
                    receipts.forEach( function(receipt) {
                        userReceipts.push(new Receipt(receipt));
                    });
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
            return new Promise(resolve => {
                lastReceiptListPage
                .$get('next')
                .then( function(nextReceiptsList) {
                    lastReceiptListPage = nextReceiptsList;
                    return nextReceiptsList.$get('receipts');
                })
                .then( function(receipts) {
                    receipts.forEach( function(receipt) {
                        userReceipts.push(new Receipt(receipt));
                    });
                    resolve(userReceipts);
                });
            });
        }

    }; // end of UserReceiptData
})();
