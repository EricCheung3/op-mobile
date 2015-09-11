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

    receiptItemController.$inject = ['$log', '$rootScope', '$scope', '$state', '$stateParams', 'receiptService', 'apiService'];

    function receiptItemController(   $log,   $rootScope ,  $scope ,  $state ,  $stateParams ,  receiptService ,  apiService) {
        $log.debug('==> receiptsItemController');

        var vm = this;
        vm.showItems = showItems;
        vm.AddToShoppingList = AddToShoppingList;
        vm.receiptImages = [];
        vm.receiptItems = [];

        $scope.ShowModel = true;

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


        function AddToShoppingList(){
            console.log("=======>AddToShoppingList");
            var items = [];

            for(var i=0;i<vm.receiptItems.length; i++){
                if(vm.receiptItems[i].checked){
                    var item = new Object();
                    console.log("vm.receiptItems[i].name", vm.receiptItems[i].name);
                    item["name"] = vm.receiptItems[i].name;
                    item["price"] = "2.98";
                    items.push(item);
                }
            }

            var object =
              {
                "storeId" : "3b50a3fc-xxxx-11e4-a322-1697f9250001", //receipt.storeId
                "items" : items
              };
            console.log("obect", object);

            // post to database
            //FIXME: please change to real data come from parser(OCR)
            apiService.getUserResource()
            .then(function (userResource) {
                userResource.$post('shoppingList', {}, object)
                  .then(function(r){
                      console.log("result", "success");
                      alert("add items to shoppingList success!");
                  });
            });
        };


    };
})();
