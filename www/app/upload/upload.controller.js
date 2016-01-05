(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .controller('UploadController', UploadController);

    UploadController.$inject = ['$log', '$rootScope', '$scope', '$location', 'apiService', 'FileUploader', 'tokenStorage'];

    function UploadController(   $log,   $rootScope,   $scope,   $location,   apiService,   FileUploader,   tokenStorage ) {
        $log.debug('==> UploadController');
        var vm = this;
        vm.uploader = new FileUploader({
            headers : {'X-AUTH-TOKEN' : tokenStorage.retrieve()}
        });
        vm.uploadFile = uploadFile;
        vm.uploadAll = uploadAll;


        apiService
        .getUserResource()
        .then( function( userResource ) {
            console.log(userResource);

            vm.uploadUrl = userResource.uploadUrl;
            vm.receiptsUrl = userResource.receiptsUrl;
            console.log("uploadUrl is "+vm.uploadUrl);
            console.log("receiptsUrl is "+vm.receiptsUrl);
        });


        function uploadFile(item) {
            console.log("upload "+item.file.name);
            item.upload();
        };

        function uploadAll() {
            console.log("upload image first");
            var imageItem = vm.uploader.queue[0];
            imageItem.url = vm.uploadUrl;
            imageItem.upload();
        };

        vm.uploader.onCompleteItem = function(item, response, status, headers) {
            console.log("Successfully uploaded item "+item.alias+", filename "+item.file.name);
            console.log("Status:"+status);
            console.log("response:"+response);

            if (status === 201 && response !== null && response.length > 0) {
                // upload ocr result
                var ocrItem = vm.uploader.queue[1];
                ocrItem.url = vm.receiptsUrl + "/" + response + "/hackload";
                console.log("Hackload OCR to :"+ocrItem.url);
                ocrItem.upload();
            }
        };
    };

})();
