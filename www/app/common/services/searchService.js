(function (){
  'use strict';

    angular
        .module('openprice.mobile')
        .factory('searchService', searchService);

    searchService.$inject = ['$log', '$rootScope', '$q', '$timeout', 'apiService'];
    function searchService(   $log,   $rootScope,   $q,   $timeout,   apiService){

        return {
            'searchItems': searchItems
        };

        function searchItems (storeId, query) {
            var deferred = $q.defer();

            apiService
            .getUserResource()
            .then(function (userResource) {
                userResource.$get('store', {storeId:storeId})
                .then(function(store){
                    return store.$get('catalogs', {query:query});
                }).then(function(items) {
                    // console.log("search-service items return",items);
                    if(items.length==0)// for new item not in catalog
                      deferred.resolve({items: [{'naturalName':query}]});
                    else
                      deferred.resolve({items: items});
                });
            });

            return deferred.promise;
        }
    }; // end of searchService
})();
