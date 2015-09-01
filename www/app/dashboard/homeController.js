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

        //vm.takePicture = takePicture;

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

        // when enter the receipts screen, load first page of receipts (default are three receipts)
        receiptService.loadFirstPageOfUserReceipts( function(receipts, receiptListsPage) {
            vm.receipts = receipts;
            vm.lastReceiptListPage = receiptListsPage;
        });

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
            })
            .finally( function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        function moreReceiptsCanBeLoaded() {
            return vm.lastReceiptListPage !== null && vm.lastReceiptListPage.$has("next");
        };

        function scrollToLoadMore(){
            console.log('==>scrollToLoadMore()');
            if(vm.lastReceiptListPage !== null && vm.lastReceiptListPage.$has("next")){
                vm.lastReceiptListPage
                .$get('next')
                .then( function(nextReceiptsList) {
                    vm.lastReceiptListPage = nextReceiptsList;
                    return nextReceiptsList.$get('receipts');
                })
                .then( function(receipts) {
                    //console.log("receipts=="+receipts+"length"+receipts.length);
                    receipts.forEach( function(receipt) {
                        vm.receipts.push(receipt);
                        receiptService
                        .getImageBase64Data(receipt.images[0]._links.base64.href)
                        .then( function(imageData){
                            receipt.path = imageData;
                        });
                    });
                })
                .finally(function() {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
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
                    console.log("Finish and send request to server to get receipt items");
                    vm.receiptImages = null;
                    //FIXME: send request to server to get receipt items
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
