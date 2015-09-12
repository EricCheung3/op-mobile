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
        vm.receipt;
        vm.showItems = showItems;
        vm.AddToShoppingList = AddToShoppingList;
        vm.receiptImages = [];
        vm.receiptItems = [];

        $scope.rating = [];
        $scope.ratingResultY = function() {
            vm.receipt.$put('feedback', {}, {"rating":1});
            $scope.rating[$scope.receiptId] = 1;
        }
        $scope.ratingResultN = function() {
            $vm.receipt.$put('rating', {}, {"rating":0});
            $scope.rating[$scope.receiptId] = 1;
        }

        $scope.receiptId = $stateParams.receiptId;

        receiptService
            .getReceiptResource2($scope.receiptId, function(receipt, receiptItems){
                vm.receipt = receipt;
                vm.receiptImages = receipt.images;
                vm.receiptItems = receiptItems;

                $scope.rating[$scope.receiptId] = receipt.rating;
                console.log("receipt rating", $scope.rating[$scope.receiptId]);
            });


        function showItems () {
            $state.go('app.dashboard.receiptItems',{receiptId:$scope.receiptId});
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
