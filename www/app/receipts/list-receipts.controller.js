(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('ReceiptListController', ReceiptListController);

    ReceiptListController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', 'receiptService', '$q', '$http' ,'$base64', '$state', '$stateParams', '$cordovaCamera', '$cordovaToast', '$ionicPopup', '$ionicLoading', '$timeout'];
    function ReceiptListController(   $log,   $rootScope,   $scope,   $location,   apiService ,  receiptService,   $q,   $http  , $base64 ,  $state ,  $stateParams,   $cordovaCamera,   $cordovaToast,   $ionicPopup,   $ionicLoading,   $timeout) {
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

        // when enter the receipts screen, load first page of receipts (default are three receipts)
        receiptService
        .loadFirstPageOfUserReceipts( function(receipts, receiptListsPage) {
            vm.receipts = receipts;
            vm.lastReceiptListPage = receiptListsPage;
        });

        function pullToRefresh() {
            console.log('==>pullToRefresh()');
            var oldLatestReceiptId = null;
            if (vm.receipts.length > 0) {
                oldLatestReceiptId = vm.receipts[0].id;
            }

            receiptService
            .loadFirstPageOfUserReceipts( function(receipts, receiptListsPage) {
                vm.receipts = receipts;
                vm.lastReceiptListPage = receiptListsPage;
                var latestReceiptId = null;
                if (vm.receipts.length > 0) {
                    latestReceiptId = vm.receipts[0].id;
                }

                console.log("vm.receipts",vm.receipts);
                if (latestReceiptId === null || latestReceiptId === oldLatestReceiptId) {
                    $cordovaToast.show('No new receipts', 'short', 'top')
                    .then( function(success){
                        console.log("The toast was shown", success);
                    }, function (error) {
                        console.log("The toast was not shown due to " + error);
                    });

                }
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        function moreReceiptsCanBeLoaded() {
            if(vm.lastReceiptListPage){
                return vm.lastReceiptListPage.$has("next");
            }else {
                return false;
            }
        };

        function scrollToLoadMore(){

            if(vm.lastReceiptListPage !== null && vm.lastReceiptListPage.$has("next")){
              receiptService
              .loadMoreReceipts(vm.receipts, vm.lastReceiptListPage,
                 function(receipts, lastReceiptListPage) {
                  vm.receipts = receipts;
                  vm.lastReceiptListPage = lastReceiptListPage;
              });

            }else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        };

        // Change to showReceipt page when users click receipt in receipt List
        function showReceipt (receiptId) {
            vm.tooltipVisible = false;
            $state.go('app.dashboard.receipt',{receiptId:receiptId});
        };

        function deleteReceipt(index) {
            vm.receipts[index].$del('self');
            vm.receipts.splice(index, 1);
        }
    } // end of function receiptsController
})();
