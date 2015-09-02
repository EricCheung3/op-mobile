(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('receiptItemController', receiptItemController)
        // REVERSE RECEIPTS' ORDER
        .filter('reverse', function () {
            return function(receiptImages) {
                return receiptImages.slice().reverse()
              }
        });

    receiptItemController.$inject = ['$log', '$rootScope', '$scope', '$state', '$stateParams', 'receiptService'];

    function receiptItemController(   $log,   $rootScope ,  $scope ,  $state ,  $stateParams ,  receiptService) {
        $log.debug('==> receiptsItemController');

        var vm = this;
        vm.showItems = showItems;
        vm.receiptImages = [];
        vm.receiptItems = [];


        var receiptId = $stateParams.receiptId;
        console.log("receiptId", receiptId);
        // get all images of the receipt
        receiptService
            .getReceiptResource(receiptId)
            .then( function(receipt) {
                vm.receiptImages = receipt.images;
                // get all items of the receipt according to its receiptId
                receipt.$get('items').then(function(items){
                    console.log("receipt items ", items);
                    vm.receiptItems = items;
                })

            });


        function showItems () {
            $state.go('app.dashboard.receiptItems',{receiptId:receiptId});
        };

        $scope.ShowModel = true;


    };
})();
