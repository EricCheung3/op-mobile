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
        vm.cropFromGallery = cropFromGallery;
        vm.upload = upload;
        vm.multiReceiptPopup = multiReceiptPopup;

        // receiptImages to control multi-upload
        vm.receiptImages = null;
        vm.takePicture();
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
                },function(err){
                    console.log(err);
                }).then(function(){
                    vm.upload();
                });
            }, false);
        };

        function cropFromGallery() {
            $log.debug('call cropFromGallery()');
            var isAndroid = ionic.Platform.isAndroid();

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

                console.log("imgURI_fromGallery====>:"+vm.imgURI);
            },function(err){
                console.log(err);
            }).then(function(){
                vm.upload();
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
                    $state.go('app.dashboard.home',{}, {reload: true});
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
                console.log("Please snap a receipt ");
                $state.go('app.dashboard.home');
            }

        };

    };
})();
