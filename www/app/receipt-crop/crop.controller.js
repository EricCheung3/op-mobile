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

        vm.cropFromGallery();

        function cropFromGallery() {
            console.log('call cropFromGallery()');
            var isAndroid = ionic.Platform.isAndroid();
            document.addEventListener("deviceready", function () {
                var options = {
                    quality: 25,
                    allowEdit:false,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType:Camera.EncodingType.JPEG,
                    correctOrientation:true,
                    saveToPhotoAlbum: false
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

        //NOTE: issue#59, no need anymore
        function multiReceiptPopup(){
          var popup = $ionicPopup.confirm({
            title: 'Receipt Upload Successful',
            template: 'Done uploading your receipts?',
            buttons: [
              {
                text: '<b>Upload more</b>',
                onTap: function(e) {
                    //console.log("call crop receipt function");
                    vm.cropFromGallery();
                    popup.close();
                }
              },
              {
                text: 'Done',
                type: 'button-positive',
                onTap: function(e) {
                    console.log("Finish and send request to server to get receipt items");
                    // vm.receiptImages = null;
                    $state.go('app.dashboard.receipts', {}, {reload: true});
                }
              }
            ]
          });
        };


        function upload() {
            console.log('call upload()');
            if(vm.imgUpload!=null){
              $ionicLoading.show({template: '<p>Uploading to server ...</p><progress></progress>'});
              apiService
                .getUserResource()
                .then( function( userResource ) {
                    var form = {
                        base64String : vm.imgUpload
                    };
                    userResource.$post('receipts', {}, form)
                    .then(function(receiptUrl) {
                        $ionicLoading.hide();
                        $state.go('app.dashboard.receipts',{}, {reload: true});
                    }, function(error) {
                        $ionicLoading.hide();
                        if(error.status === 413){
                            alert("Sorry, the image is too large, it's not allowed! Please select a picture again!");
                        }else {
                            alert("Unknown error.");  
                        }
                        $state.go('app.dashboard.receipts');
                    });

                }, function(err) {
                    $ionicLoading.hide();
                    alert("An error has occurred: Code = " + err.code);
                    $state.go('app.dashboard.receipts');
                });

            }else{
                $state.go('app.dashboard.receipts');
            }
        };

    };
})();
