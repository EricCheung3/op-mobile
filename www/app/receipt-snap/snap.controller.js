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

        vm.takePicture();

        function takePicture() {
            $log.debug('call takePicture()');
            document.addEventListener("deviceready", function () {
                var options = {
                    quality:25,
                    allowEdit:false,
                    destinationType:Camera.DestinationType.DATA_URL,
                    sourceType:Camera.PictureSourceType.Camera,
                    encodingType:Camera.EncodingType.JPEG,
                    correctOrientation:true,
                    saveToPhotoAlbum:false
                };

                $cordovaCamera
                .getPicture(options)
                .then( function(imageData) {
                    vm.imgURI = "data:image/jpeg;base64,"+ imageData; //[DATA_URL]
                    vm.imgUpload = imageData;
                }, function(err) {
                    console.log(err);
                })
                .then(function() {
                    vm.upload();
                });
            }, false);
        };

        // NOTE:issue#59, no need anymore
        function multiReceiptPopup(){
          var popup = $ionicPopup.confirm({
            title: 'Receipt Upload Successful',
            template: 'Are you done scanning your receipt?',
            buttons: [
              {
                text: '<b>Scan more</b>',
                onTap: function(e) {
                    //console.log("call snap receipt function");
                    vm.takePicture();
                    popup.close();
                }
              },
              {
                text: 'Done' ,
                type: 'button-positive',
                onTap: function(e) {
                    console.log("Finish and send request to server to get receipt items");
                    // vm.newReceipt = null;
                    $state.go('app.dashboard.receipts',{}, {reload: true});
                }
              }
            ]
          });
        };


        function upload() {
            $log.debug('call upload()');

            if (vm.imgUpload!=null) {
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
                            alert("Sorry, the image is too large, it's not allowed! Please take a picture again!");
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

            } else {
                $state.go('app.dashboard.receipts');
            }

        };

    };
})();
