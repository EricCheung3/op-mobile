(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('ReceiptDisplayController', ReceiptDisplayController)
        // REVERSE RECEIPTS' ORDER
        .filter('reverse', function () {
            return function(receiptImages) {
                return receiptImages.slice().reverse()
              }
        });

    ReceiptDisplayController.$inject = ['$log', '$location','$rootScope', '$scope', '$state', '$stateParams', '$ionicPopup', 'receiptService', 'apiService'];

    function ReceiptDisplayController(   $log,   $location , $rootScope ,  $scope ,  $state ,  $stateParams ,  $ionicPopup ,  receiptService ,  apiService) {
        $log.debug('==> ReceiptDisplayController');

        var vm = this;
        vm.receipt;
        vm.selectItemMode = false;
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

        // load receipt data from database
        receiptService
        .loadReceipt($stateParams.receiptId)
        .then( function(receipt) {
            vm.receipt = receipt;
        })

        function showItems () {
            $state.go('app.dashboard.receiptItems',{receiptId:$scope.receiptId});
        };

        function editItem (item){
            $scope.item1 = {"name":item.displayName,"price":Number(item.displayPrice)};

            var popup = $ionicPopup.show({
                title: 'Edit Item',
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
                { text: 'Done',
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

        function deleteItem (index,item){
            vm.receipt.$del("item",{itemId:item.id});
            console.log("Delete",item.id);
            vm.receiptItems.splice(index, 1);
        };

        // need to extract it out into a service
        function addToShoppingList(){
            var items = [];

            for(var i=0;i<vm.receipt.result.items.length; i++){
                var receiptItem = vm.receipt.result.items[i];
                if(receiptItem.checked){
                    items.push({
                        name : receiptItem.displayName,
                        catalogCode : receiptItem.catalogCode
                    });
                }
            }

            var shoppingList =
              {
                "chainCode" : vm.receipt.result.chainCode, //receipt.chainCode
                "items" : items
              };

            // post shopping list to database
            apiService
            .getUserResource()
            .then(function (userResource) {

                userResource
                .$post('shoppingList', {}, shoppingList)
                .then( function(location){
                      // jump to shopping list page
                      var shoppingStoreId = location.substring(location.lastIndexOf('/') + 1);
                      console.log('upload shopping list success! shoppingStoreId is', shoppingStoreId);
                      vm.selectItemMode = false; // clear selec mode
                      $state.go('app.dashboard.store', {'storeId':shoppingStoreId});

                  });
            });
        };


    };
})();
