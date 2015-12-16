(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .controller('homeController', homeController);

    homeController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', 'receiptService', '$q', '$http' ,'$base64', '$state', '$stateParams', '$cordovaCamera', '$ionicPopup', '$ionicLoading', '$timeout'];
    function homeController(   $log,   $rootScope,   $scope,   $location,   apiService ,  receiptService,   $q,   $http  , $base64 ,  $state ,  $stateParams,   $cordovaCamera,   $ionicPopup,   $ionicLoading,   $timeout) {
        $log.debug('==> homeController');
        // get all the receipts of user
        var vm = this;
        vm.receipts = [];
        vm.lastReceiptListPage = null;

        vm.pullToRefresh = pullToRefresh;
        vm.scrollToLoadMore = scrollToLoadMore;
        vm.moreReceiptsCanBeLoaded = moreReceiptsCanBeLoaded;
        vm.showReceipt = showReceipt;
        vm.deleteReceipt = deleteReceipt;

        vm.shouldShowDelete = false; //?
        vm.listCanSwipe = true; //?

        // for snap receipt features
        vm.openFab = false;
        vm.tooltipVisible = false;
        vm.imgURI = 'img/background.png';
        vm.imgUpload = null;
        vm.takePicture = takePicture;
        vm.cropFromGallery = cropFromGallery;
        vm.upload = upload;
        vm.multiReceiptPopup = multiReceiptPopup;
        vm.switchFabMenu = switchFabMenu;

        // receiptImages to control multi-upload
        vm.receiptImages = null;

        vm.receipts;
        vm.lastReceiptListPage;

        // when enter the receipts screen, load first page of receipts (default are three receipts)
        receiptService.loadFirstPageOfUserReceipts( function(receipts, receiptListsPage) {
            vm.receipts = receipts;
            console.log("receipt",receipts);
            vm.lastReceiptListPage = receiptListsPage;
        });

        // vm.pullToRefresh();
        function switchFabMenu() {
          //console.log('==>switchFabMenu()');
          vm.openFab = !vm.openFab;
        };

        $scope.$watch('vm.openFab', function() {
            $timeout(function() {
                vm.tooltipVisible = vm.openFab;
                //console.log('turn vm.tooltipVisible to '+vm.tooltipVisible);
            }, 300);
        });

        function pullToRefresh() {
            console.log('==>pullToRefresh()');
            receiptService
            .loadFirstPageOfUserReceipts( function(receipts, receiptListsPage) {
                vm.receipts = receipts;
                vm.lastReceiptListPage = receiptListsPage;
                console.log("vm.receipts",vm.receipts);
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                receiptService
                    .getReceiptResource2(vm.receipts[0].id, function(receipt, receiptParseResult){
                        vm.receipt = receipt;
                        vm.receiptParseResult = receiptParseResult;
                        // console.log("receipt", receipt);
                        // console.log("receiptParseResult", receiptParseResult);
                    });
            });

            /**[ASYN]
             * asynchronization to get uploaded receipt information.
             * just for the latest one. []
             */
            //  receiptService
            //      .getReceiptResource2(vm.receipts[0].id, function(receipt, receiptParseResult){
            //          vm.receipt = receipt;
            //          vm.receiptParseResult = receiptParseResult;
             //
            //          console.log("receiptParseResult", receiptParseResult);
            //      });

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
                console.log("No next page now...");
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        };

        // Change to showReceipt page when users click receipt in receipt List
        function showReceipt (receiptId) {
            vm.tooltipVisible = false;
            $state.go('app.dashboard.receiptItem',{receiptId:receiptId});
        };

        function deleteReceipt(index) {
            vm.receipts[index].$del('self');
            vm.receipts.splice(index, 1);
        }

        function takePicture() {
            $log.debug('call takePicture()');
            document.addEventListener("deviceready", function () {
                var options = {
                    quality:50,
                    allowEdit:true,
                    //  targetWidth: 150, //[any size when crop]
                    //  targetHeight: 350,
                    // destinationType: should be DATA_URL for crop
                    destinationType:Camera.DestinationType.DATA_URL,
                    sourceType:Camera.PictureSourceType.Camera,
                    encodingType:Camera.EncodingType.JPEG,
                    popoverOptions:CameraPopoverOptions,
                    correctOrientation:true,
                    saveToPhotoAlbum:true
                };

                /*  BUG [solved]: imgURI is not defined*/
                $cordovaCamera.getPicture(options).then( function(imageData) {
                    vm.imgURI = "data:image/jpeg;base64,"+ imageData; //[DATA_URL]
                    vm.imgUpload = imageData;
                    console.log('imgURI_takePicture====>'+vm.imgURI);
                    vm.upload();
                },function(err){
                    console.log(err);
                });
            }, false);
        };

        function cropFromGallery() {
            $log.debug('call cropFromGallery()');
            var options = {
                quality: 50,
                allowEdit:true,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                encodingType:Camera.EncodingType.JPEG,
                correctOrientation:true,
                saveToPhotoAlbum: true
            };

            $cordovaCamera.getPicture(options).then(function(imageData){
                vm.imgURI = "data:image/jpeg;base64,"+ imageData;
                vm.imgUpload = imageData;
                vm.upload();

                console.log("imgURI_fromGallery====>:"+vm.imgURI);
            },function(err){
                console.log(err);
            });

        };

        function multiReceiptPopup(){
          var popup = $ionicPopup.confirm({
            title: 'Upload Receipt Success',
            template: 'Did you finish scaning the same receipt?',
            buttons: [
              {
                text: 'Finish' ,
                onTap: function(e) {
                    vm.receiptImages = null;
                    //FIXME: send request to server to get receipt items
                    //NOTE: DONE
                    vm.pullToRefresh();
                }
              },
              {
                text: '<b>Continue</b>',
                type: 'button-positive',
                onTap: function(e) {
                    console.log("call snap receipt function");
                    vm.takePicture();
                    popup.close();
                }
              }
            ]
          });
        };

        function upload() {
            $log.debug('call upload()');
            vm.date = new Date();
            if(vm.imgUpload!=null){
              $ionicLoading.show({template: 'Uploading to server ...'});
              apiService
                .getUserResource()
                .then( function( userResource ) {
                    var form = {
                        base64String : vm.imgUpload
                    };
                    // first upload
                    if(vm.receiptImages == null){
                        userResource.$post('receipts', {}, form).then(function(receiptUrl){
                        $ionicLoading.hide();
                        //receiptUrl:http://104.197.47.140/api/user/receipts/6fe81a5b-f933-4fe6-8769-bce41677afeb
                        // A confirm dialog for multi-receipt upload
                        apiService.getResource(receiptUrl)
                          .then(function(receiptResource) {
                            console.log("receiptResource", receiptResource);
                            // first upload or not
                            vm.receiptImages = receiptResource;
                          })
                        // multi-receipt continue or not
                        vm.multiReceiptPopup();
                      });
                    }else{
                        vm.receiptImages.$post('images', {}, form).then(function(receiptUrl){
                        $ionicLoading.hide();
                        //http://104.197.47.140/api/user/receipts/6fe81a5b-f933-4fe6-8769-bce41677afeb
                        vm.multiReceiptPopup();
                      });
                    }

                }, function(err) {
                    $ionicLoading.hide();
                    alert("An error has occurred: Code = " + err.code);
                });

            }else{
                alert("Please snap a receipt ");
            }
        }
    } // end of function receiptsController
})();
