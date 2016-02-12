(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .filter('object2Array', function() {
            return function(input) {
                var out = [];
                for(var i in input){
                    out.push(input[i]);
                }
                return out;
            }
        })
        .controller('TimelineController', TimelineController);

    TimelineController.$inject = ['$log', '$scope', 'apiService', 'UserReceiptData', '$state', '$cordovaToast'];
    function TimelineController(   $log,   $scope,   apiService ,  UserReceiptData,   $state ,  $cordovaToast) {
        $log.debug('==> TimelineController');

        var vm = this;
        vm.pullToRefresh = pullToRefresh;
        vm.showReceipt = showReceipt;
        vm.deleteReceipt = deleteReceipt;

        vm.groups = {};
        updateGroups();


        function updateGroups() {
            console.log('==>updateGroups()');
            UserReceiptData
            .getTimeline()
            .then( groups => {
                //console.log('init groups: ', groups);
                vm.groups = groups;
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        function pullToRefresh() {
            console.log('==>pullToRefresh()');
            UserReceiptData.refresh();
            updateGroups();
        };

        function showReceipt(receipt) {
            if (receipt.status === 'HAS_RESULT') {
                $state.go('app.dashboard.receipt', {receiptId: receipt.id});
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
