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

        UserReceiptData
        .getTimeline()
        .then( function(groups) {
            console.log('init groups: ', groups);
            vm.groups = groups;
        });

        function updateGroups() {
            console.log('==>updateGroups()');
            UserReceiptData
            .getTimeline()
            .then( function(groups) {
                console.log('update groups: ', groups);
                $scope.$apply(function () {
                    vm.groups = groups;
                });
            });
        };

        function pullToRefresh() {
            console.log('==>pullToRefresh()');
            UserReceiptData.refresh();
            updateGroups();
            $scope.$broadcast('scroll.refreshComplete');
        };

        function showReceipt(receipt) {
            if (receipt.status === 'HAS_RESULT') {
                $state.go('app.dashboard.receipt', {receiptId: receipt.id});
            }
        };

        function deleteReceipt(group, index, receipt) {
            console.log("receipt",receipt);
            receipt.$del('self');
            if (index > -1) {
                vm.groups[group.key].receipts.splice(index, 1);
            }
            if (vm.groups[group.key].receipts.length === 0) {
                delete vm.groups[group.key];
            }
            UserReceiptData.refresh();
        };

    } // end of function receiptsController
})();
