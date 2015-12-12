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

    receiptItemController.$inject = ['$log', '$location','$rootScope', '$scope', '$state', '$stateParams', '$ionicPopup', 'receiptService', 'apiService'];

    function receiptItemController(   $log,   $location , $rootScope ,  $scope ,  $state ,  $stateParams ,  $ionicPopup ,  receiptService ,  apiService) {
        $log.debug('==> receiptsItemController');

        var vm = this;
        vm.receipt;
        vm.showItems = showItems;
        vm.editItem = editItem;
        vm.deleteItem = deleteItem;
        vm.addToShoppingList = addToShoppingList;
        vm.receiptParseResult;
        vm.receiptImages = [];
        vm.receiptItems = [];
        $scope.delay = false;
        $scope.rating = [];
        $scope.ratingResultY = function() {
            vm.receipt.$post('feedback', {}, {"rating":1,"comment":""});
            $scope.rating[$scope.receiptId] = 1;
        }
        $scope.ratingResultN = function() {
            vm.receipt.$post('feedback', {}, {"rating":0, "comment":""});
            $scope.rating[$scope.receiptId] = 0;
        }

        $scope.receiptId = $stateParams.receiptId;


        receiptService
            .getReceiptResource2($scope.receiptId, function(receipt, receiptParseResult){
                vm.receipt = receipt;
                vm.receiptImages = receipt.images;
                vm.receiptItems = receiptParseResult.items;
                vm.receiptParseResult = receiptParseResult;
                $scope.rating[$scope.receiptId] = receipt.rating;
                $scope.delay = "true";
                // console.log("receipt rating", $scope.rating[$scope.receiptId]);
                // console.log("chainCode", receiptParseResult);
            });


        function showItems () {
            $state.go('app.dashboard.receiptItems',{receiptId:$scope.receiptId});
        };
        vm.items;
        vm.itemPage;
        function editItem (item){
            $scope.item1 = {"name":item.displayName,"price":Number(item.displayPrice)};

            var popup = $ionicPopup.show({
              // title: 'Edit Item',
              // subTitle: 'Please input item name and price',
              scope: $scope,
              template: '<input type="text" placeholder={{$scope.item1.name}} ng-model="item1.name"><input type="number" placeholder={{$scope.item1.price}} ng-model="item1.price" >',
              buttons: [
                { text: 'Cancel' ,
                  type: 'button-positive',
                  onTap: function(e) {
                      popup.close();
                  }
                },
                { text: 'Finish',
                  type: 'button-positive',
                  onTap: function(e) {
                    return $scope.item1;
                  }
                }
              ]
            });

            popup.then(function(res) {
                if(res==undefined ){
                    console.log('cancel');
                }else if (res.name!==null&&res.price!==null&& res.name!== undefined&&res.price!== undefined) {
                    item.displayName = res.name;
                    item.displayPrice = res.price;
                    // update data to server
                    vm.receipt.$put("item",{itemId:item.id},res);
                }else {
                    console.log('Input is illegal');
                }
             });

        };

        function deleteItem (item){
            vm.receipt.$del("item",{itemId:item.id});
            vm.receiptItems.splice(item, 1);
        };

        // need to extract it out into a service
        function addToShoppingList(){
            console.log("=======>addToShoppingList");
            var items = [];

            for(var i=0;i<vm.receiptItems.length; i++){
                if(vm.receiptItems[i].checked){
                    var item = new Object();
                    console.log("vm.receiptItems[i].name", vm.receiptItems[i].displayName);
                    item["name"] = vm.receiptItems[i].displayName;
                    item["displayPrice"] = vm.receiptItems[i].displayPrice;
                    item["catalogCode"] = vm.receiptItems[i].catalogCode;
                    item["labelCodes"] = vm.receiptItems[i].labelCodes;
                    items.push(item);
                }
            }

            var object =
              {
                "chainCode" : vm.receiptParseResult.chainCode, //receipt.chainCode
                "items" : items
              };
            console.log("added items obect", object);

            // post to database
            //FIXME: please change to real data come from parser(OCR)
            apiService.getUserResource()
            .then(function (userResource) {
                userResource.$post('shoppingList', {}, object)
                  .then(function(r){
                      console.log("result", "success");
                      // confirm("add items to shoppingList success!");
                  });
            });
        };


    };
})();
