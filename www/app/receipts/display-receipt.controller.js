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

    ReceiptDisplayController.$inject = ['$log', '$location','$rootScope', '$scope', '$state', '$stateParams', '$ionicPopup', 'UserReceiptData', 'apiService'];

    function ReceiptDisplayController(   $log,   $location , $rootScope ,  $scope ,  $state ,  $stateParams ,  $ionicPopup ,  UserReceiptData ,  apiService) {
        $log.debug('==> ReceiptDisplayController');

        var vm = this;
        vm.receipt;
        vm.selectItemMode = false;
        vm.editItem = editItem;
        vm.deleteItem = deleteItem;
        vm.addToShoppingList = addToShoppingList;
        vm.receiptParseResult;
        vm.receiptImages = [];
        vm.receiptItems = [];

        $scope.ratingsObject = {
          // iconOn: 'ion-ios-heart',            //Optional
          // iconOff: 'ion-ios-heart-outline',   //Optional
          iconOnColor: 'red',                 //Optional
          iconOffColor: 'rgb(200, 100, 100)', //Optional
          callback: function(rating) {
            $scope.inputFeedback(rating);
          }
        };

        $scope.inputFeedback = function(rating) {
          $scope.feedback = {
              comment: "",
              rating: rating
              };
          $scope.ratings = {
            iconOnColor: 'red',
            iconOffColor: 'rgb(200, 100, 100)',
            rating: rating,
            callback: function(rating) {
                $scope.feedback.rating = rating;
            }
          };
          var myPopup = $ionicPopup.show({
            title: 'Give us your feedback',
            templateUrl: 'app/receipts/receipt-rating.tmpl.html',
            scope: $scope,
            buttons: [
              {
                text: 'Submit',
                type: 'button button-small button-positive',
                onTap: function(e) { return $scope.feedback; }
              }
            ]
          });

          myPopup.then(function(feedback) {
            console.log(feedback);
            vm.receipt.$post('feedback', {}, {"rating":feedback.rating,"comment":feedback.comment});
            vm.needFeedback = false;
          });
        };


        // load receipt data from database
        UserReceiptData
        .loadReceiptById($stateParams.receiptId)
        .then( function(receipt) {
            vm.receipt = receipt;
            vm.needFeedback = vm.receipt.needFeedback;
        })

        function editItem(item){
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
                if (res === undefined ){
                    console.log('cancel');
                } else if (res.name!==null&&res.price!==null&& res.name!== undefined&&res.price!== undefined) {
                    item.displayName = res.name;
                    item.displayPrice = res.price;
                    // update data to server
                    vm.receipt.$put("item", {itemId:item.id}, res);
                } else {
                    console.log('Input is illegal');
                }
             });
        }; // end of editItem()

        function deleteItem(index,item) {
            vm.receipt.$del("item",{itemId:item.id});
            vm.receiptItems.splice(index, 1);
        };

        // need to extract it out into a service
        function addToShoppingList() {
            var items = [];

            vm.receipt.items.forEach( function(receiptItem) {
                if(receiptItem.checked){
                    items.push({
                        name : receiptItem.displayName,
                        catalogCode : receiptItem.catalogCode,
                        number : 1
                    });
                }
            });
            console.log('=>addToShoppingList() with items:', items);

            var shoppingList =
              {
                "chainCode" : vm.receipt.chainCode, //receipt.chainCode
                "items" : items
              };

            // post shopping list to database
            apiService
            .getUserResource()
            .then(function (userResource) {

                userResource
                .$post('shoppingList', {}, shoppingList)
                .then( function(location){
                      // FIXME: [should be ionic1 bug]: jump to shopping list page
                      // var shoppingStoreId = location.substring(location.lastIndexOf('/') + 1);
                      // console.log('upload shopping list success! shoppingStoreId is', shoppingStoreId);
                      // vm.selectItemMode = false; // clear selec mode
                      // $state.go('app.dashboard.store', {'storeId':shoppingStoreId});

                      vm.storeName = vm.receipt.chainCode=='rcss' ? 'Superstore' : vm.receipt.chainCode;
                      $ionicPopup.alert({
                          title: 'Switch to ' + vm.storeName.toUpperCase() +' to check items',
                          cssClass: 'success'
                      }).then(function(response) {
                          //switch to store list
                          $state.go('app.dashboard.stores');
                      });

                  });
            });
        }; // end of addToShoppingList()

    };
})();
