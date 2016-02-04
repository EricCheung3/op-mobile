(function () {
'use strict';

    angular
        .module('openprice.mobile')
        .factory('UserShoppingData', UserShoppingData);

    UserShoppingData.$inject = ['$log', '$q', '$http', 'apiService'];
    function UserShoppingData(   $log,   $q,   $http,   apiService) {
        var userShoppingStores;
        var lastStoreListPage;

        return {
            'loadFirstPage' : loadFirstPage,
            'hasNextPage' : hasNextPage,
            'loadNextPage' : loadNextPage,
            'loadShoppingStoreById' : loadShoppingStoreById
        };

        function Store(resource) {
            this.resource = resource;
        };

        function loadFirstPage() {
            console.log('==>UserShoppingData.loadFirstPage()');
            userShoppingStores = [];
            return new Promise(resolve => {
                apiService
                .getUserResource()
                .then( function(resource) {
                    return resource.$get('stores');
                })
                .then( function(storeList) {
                    lastStoreListPage = storeList;
                    if(storeList.$has('shoppingStores')){
                        return storeList.$get('shoppingStores');
                    } else {
                        return $q.reject("NO stores!");
                    }
                }).then( function(stores) {
                    if (stores) {
                        stores.forEach( function(store) {
                            userShoppingStores.push(new Store(store));
                        });
                    }
                    resolve(userShoppingStores);
                });
            });
        };

        function hasNextPage() {
            if (lastStoreListPage) {
                return lastStoreListPage.$has('next');
            }
            return false;
        };

        function loadNextPage() {
            console.log('==>UserShoppingData.loadNextPage()');
            return new Promise(resolve => {
                lastStoreListPage
                .$get('next')
                .then( function(nextStoreList) {
                    console.log('get next page:', nextStoreList);
                    console.log('has next: ', nextStoreList.$has('next'));
                    lastStoreListPage = nextStoreList;
                    return nextStoreList.$get('shoppingStores');
                })
                .then( function(shoppingStores) {
                    console.log('==>UserReceiptData.loadNextPage(), get next shoppingStores:', shoppingStores);
                    shoppingStores.forEach( function(store) {
                        userShoppingStores.push(new Store(store));
                    });
                    resolve(userStores);
                });
            });
        };

        function loadShoppingStoreById(shoppingStoreId) {
            return new Promise(resolve => {
                apiService
                .getUserResource()
                .then( function(userResource) {
                    return userResource.$get('store', {'storeId': shoppingStoreId});
                })
                .then( function(shoppingStore) {
                    shoppingStore.$get('shoppingItems')
                    .then( function(items) {
                        shoppingStore.items = items;
                    });
                    resolve(shoppingStore);
                });

            });
        };

    }; // end of UserReceiptData
})();
