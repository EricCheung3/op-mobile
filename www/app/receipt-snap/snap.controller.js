(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('SnapController', SnapController);

    SnapController.$inject = ['$log', '$state', '$rootScope', '$scope', '$location', 'apiService', 'tokenStorage', '$cordovaCamera','$cordovaFileTransfer','$ionicLoading', '$cordovaFile', '$http', '$ionicPopup'];

    function SnapController(   $log,   $state ,  $rootScope,   $scope,   $location,   apiService ,  tokenStorage,   $cordovaCamera,  $cordovaFileTransfer,  $ionicLoading,   $cordovaFile ,  $http,   $ionicPopup) {
        $log.debug('==> SnapController');

        /* jshint validthis: true */
        var vm = this;
        vm.imgURI = 'img/background.png';
        vm.imgUpload = null;
        vm.takePicture = takePicture;
        vm.upload = upload;
        vm.multiReceiptPopup = multiReceiptPopup;
        vm.newReceipt = null;
        vm.takePicture();

        function takePicture() {
            $log.debug('call takePicture()');
            document.addEventListener("deviceready", function () {
                var options = {
                    quality:50,
                    allowEdit:true,
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
                },function(err){
                    console.log(err);
                }).then(function(){
                    vm.upload();
                });
            }, false);
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
                    vm.newReceipt = null;
                    $state.go('app.dashboard.receipts',{}, {reload: true});
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

            if (vm.imgUpload!=null) {
              $ionicLoading.show({template: 'Uploading to server ...'});
              apiService
                .getUserResource()
                .then( function( userResource ) {
                    var form = {
                        base64String : vm.imgUpload
                    };
                    if(vm.newReceipt === null){
                        // first image for new receipt
                        userResource
                        .$post('receipts', {}, form)
                        .then( function(receiptUrl) {
                            $ionicLoading.hide();
                            apiService.getResource(receiptUrl)
                              .then(function(receiptResource) {
                                vm.newReceipt = receiptResource;
                              })
                            // multi-receipt continue or not
                            vm.multiReceiptPopup();
                        });
                    } else {
                        // upload more image
                        vm.newReceipt
                        .$post('images', {}, form)
                        .then( function(receiptUrl) {
                            $ionicLoading.hide();
                            vm.multiReceiptPopup();
                        });
                    }

                }, function(err) {
                    $ionicLoading.hide();
                    alert("An error has occurred: Code = " + err.code);
                });

            } else {
                $state.go('app.dashboard.receipts');
            }

        };

    };
})();
