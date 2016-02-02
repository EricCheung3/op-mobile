(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('ReceiptListController', ReceiptListController);

    ReceiptListController.$inject = ['$log', '$scope', 'apiService', 'UserReceiptData', '$q', '$state', '$cordovaToast'];
    function ReceiptListController(   $log,   $scope,   apiService ,  UserReceiptData,   $q,   $state ,  $cordovaToast) {
        $log.debug('==> ReceiptListController');
        // get all the receipts of user
        var vm = this;
        vm.receipts = [];
        vm.lastReceiptListPage = null;

        vm.pullToRefresh = pullToRefresh;
        vm.scrollToLoadMore = scrollToLoadMore;
        vm.moreReceiptsCanBeLoaded = moreReceiptsCanBeLoaded;
        vm.showReceipt = showReceipt;
        vm.deleteReceipt = deleteReceipt;

        UserReceiptData
        .loadFirstPage()
        .then( function(receipts) {
            console.log('init : ', receipts);
            vm.receipts = receipts;
        });

        function pullToRefresh() {
            console.log('==>pullToRefresh()');
            var oldLatestReceiptId = null;
            if (vm.receipts.length > 0) {
                oldLatestReceiptId = vm.receipts[0].id;
            }

            UserReceiptData
            .loadFirstPage()
            .then( function(receipts) {
                vm.receipts = receipts;
                var latestReceiptId = null;
                if (vm.receipts.length > 0) {
                    latestReceiptId = vm.receipts[0].id;
                }
                if (latestReceiptId === null || latestReceiptId === oldLatestReceiptId) {
                    $cordovaToast.show('No new receipts', 'short', 'top')
                    .then( function(success){
                        //console.log("The toast was shown", success);
                    }, function (error) {
                        console.log("The toast was not shown due to " + error);
                    });
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        function moreReceiptsCanBeLoaded() {
            return UserReceiptData.hasNextPage();
        };

        function scrollToLoadMore() {
            console.log('==>scrollToLoadMore()');
            if(UserReceiptData.hasNextPage()) {
                UserReceiptData
                .loadNextPage()
                .then( function(receipts){
                    vm.receipts = receipts;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        };

        // Change to showReceipt page when users click receipt in receipt List
        function showReceipt (receipt) {
            if (receipt.loaded) {
                $state.go('app.dashboard.receipt',{receiptId: receipt.resource.id});
            }
        };

        function deleteReceipt(receipt) {
            receipt.resource.$del('self');
            var index = vm.receipts.indexOf(receipt);
            if (index > -1) {
                vm.receipts.splice(index, 1);
            }
        };
    } // end of function receiptsController
})();
