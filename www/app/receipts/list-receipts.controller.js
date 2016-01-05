(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('receiptsController', receiptsController)
        // REVERSE RECEIPTS' ORDER
        .filter('reverse', function () {
            return function(receipts) {
                return receipts.slice().reverse()
              }
        });

    // NOTE:NOTE:NOTE: this js file was deprecated

    receiptsController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', 'receiptService', '$q', '$http' ,'$base64', '$state', '$stateParams'];
    function receiptsController(   $log,   $rootScope,   $scope,   $location,   apiService ,  receiptService,   $q,   $http  , $base64 ,  $state ,  $stateParams) {
        $log.debug('==> receiptsController');
        // get all the receipts of user
        var vm = this;
        vm.receipts = [];
        vm.lastReceiptListPage = null;

        vm.pullToRefresh = pullToRefresh;
        vm.scrollToLoadMore = scrollToLoadMore;
        vm.moreReceiptsCanBeLoaded = moreReceiptsCanBeLoaded;
        vm.showReceipt = showReceipt;
        vm.deleteReceipt = deleteReceipt;

        vm.shouldShowDelete = false; //?
        vm.listCanSwipe = true; //?

        // when enter the receipts screen, load first page of receipts (default are three receipts)
        receiptService.loadFirstPageOfUserReceipts( function(receipts, receiptListsPage) {
            vm.receipts = receipts;
            vm.lastReceiptListPage = receiptListsPage;
        });

        function pullToRefresh() {
            console.log('==>pullToRefresh()');
            receiptService
            .loadFirstPageOfUserReceipts( function(receipts, receiptListsPage) {
                vm.receipts = receipts;
                vm.lastReceiptListPage = receiptListsPage;
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        function moreReceiptsCanBeLoaded() {
            return vm.lastReceiptListPage !== null && vm.lastReceiptListPage.$has("next");
        };

        function scrollToLoadMore(){
            console.log('==>scrollToLoadMore()');
            if(vm.lastReceiptListPage !== null && vm.lastReceiptListPage.$has("next")){
                vm.lastReceiptListPage
                .$get('next')
                .then( function(nextReceiptsList) {
                    vm.lastReceiptListPage = nextReceiptsList;
                    return nextReceiptsList.$get('receipts');
                })
                .then( function(receipts) {
                    //console.log("receipts=="+receipts+"length"+receipts.length);
                    receipts.forEach( function(receipt) {
                        vm.receipts.push(receipt);
                        receiptService
                        .getImageBase64Data(receipt.images[0]._links.base64.href)
                        .then( function(imageData){
                            receipt.path = imageData;
                        });
                    });
                })
                .finally(function() {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }else {
                console.log("No next page now...");
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        };

        // Change to showReceipt page when users click receipt in receipt List
        function showReceipt (receiptId) {
            $state.go('app.dashboard.receiptItem',{receiptId:receiptId});
        };

        //FIXME: delete receipt from database
        function deleteReceipt(receiptId){
            console.log("=====>delete receit");

        };


    } // end of function receiptsController
})();
