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

    receiptItemController.$inject = ['$log', '$rootScope', '$scope', '$stateParams', 'receiptService'];
    function receiptItemController(   $log,   $rootScope ,  $scope ,  $stateParams ,  receiptService) {
        $log.debug('==> receiptsItemController');

        var vm = this;
        vm.receiptImages = [];

        var receiptId = $stateParams.receiptId;
        console.log("receiptId", receiptId);
        // get all images of the receipt
        receiptService
            .getReceiptResource(receiptId)
            .then( function(receipt) {
                vm.receiptImages = receipt.images;
            });

    };

})();
