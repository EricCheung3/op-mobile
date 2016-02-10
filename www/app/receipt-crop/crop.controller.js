(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('CropController', CropController);

    CropController.$inject = ['$log', '$state', '$rootScope', '$scope', '$location', 'apiService', 'tokenStorage', '$cordovaCamera','$cordovaFileTransfer','$ionicLoading', '$cordovaFile', '$http', '$ionicPopup'];

    function CropController(   $log,   $state ,  $rootScope,   $scope,   $location,   apiService ,  tokenStorage,   $cordovaCamera,  $cordovaFileTransfer,  $ionicLoading,   $cordovaFile ,  $http,   $ionicPopup) {
        $log.debug('==> CropController');

        /* jshint validthis: true */
        var vm = this;
        vm.imgURI = 'img/background.png';
        vm.imgUpload = null;
        vm.cropFromGallery = cropFromGallery;
        vm.upload = upload;
        vm.multiReceiptPopup = multiReceiptPopup;

        // receiptImages to control multi-upload
        vm.receiptImages = null;
        vm.cropFromGallery();

        function cropFromGallery() {
            console.log('call cropFromGallery()');
            var isAndroid = ionic.Platform.isAndroid();
            document.addEventListener("deviceready", function () {
                var options = {
                    quality: 50,
                    allowEdit:true,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType:Camera.EncodingType.JPEG,
                    correctOrientation:true,
                    saveToPhotoAlbum: true
                };

                $cordovaCamera
                .getPicture(options)
                .then(function(imageData){
                    vm.imgURI = "data:image/jpeg;base64,"+ imageData;
                    vm.imgUpload = imageData;
                }, function(err) {
                    console.log(err);
                })
                .then( function() {
                    //$log.debug('finished from gallary.');
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
                    vm.receiptImages = null;
                    $state.go('app.dashboard.receipts', {}, {reload: true});
                }
              },
              {
                text: '<b>Continue</b>',
                type: 'button-positive',
                onTap: function(e) {
                    //console.log("call crop receipt function");
                    vm.cropFromGallery();
                    popup.close();
                }
              }
            ]
          });
        };


        function upload() {
            console.log('call upload()');

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
                $state.go('app.dashboard.receipts');
            }

        };

    };
})();
