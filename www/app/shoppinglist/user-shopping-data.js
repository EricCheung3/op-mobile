(function () {
'use strict';

    angular
        .module('openprice.mobile')
        .factory('UserShoppingData', UserShoppingData);

    UserShoppingData.$inject = ['$log', '$http', 'apiService'];
    function UserShoppingData(   $log,   $http,   apiService) {
        var vmUserShoppingData = this;
        vmUserShoppingData.userShoppingStores;
        vmUserShoppingData.lastStoreListPage;
        vmUserShoppingData.categoryList;

        return {
            'categoryList' : categoryList,
            'loadFirstPage' : loadFirstPage,
            'hasNextPage' : hasNextPage,
            'loadNextPage' : loadNextPage,
            'loadShoppingStoreById' : loadShoppingStoreById
        };

        function Store(resource) {
            this.resource = resource;
        };

        function categoryList() {
            if (vmUserShoppingData.categoryList) {
                return Promise.resolve(vmUserShoppingData.categoryList);
            }

            return new Promise(resolve => {
                apiService
                .getUserResource()
                .then(function (userResource) {
                    return userResource.$get('categories')
                })
                .then( function(categories) {
                    vmUserShoppingData.categoryList = categories;
                    resolve(vmUserShoppingData.categoryList);
                });
            });
        };

        function loadFirstPage() {
            console.log('==>UserShoppingData.loadFirstPage()');
            vmUserShoppingData.userShoppingStores = [];
            return new Promise(resolve => {
                apiService
                .getUserResource()
                .then( function(resource) {
                    return resource.$get('stores');
                })
                .then( function(storeList) {
                    vmUserShoppingData.lastStoreListPage = storeList;
                    if(storeList.$has('shoppingStores')){
                        return storeList.$get('shoppingStores');
                    } else {
                        return Promise.reject("NO stores!");
                    }
                }).then( function(stores) {
                    if (stores) {
                        stores.forEach( function(store) {
                            vmUserShoppingData.userShoppingStores.push(new Store(store));
                        });
                    }
                    resolve(vmUserShoppingData.userShoppingStores);
                });
            });
        };

        function hasNextPage() {
            if (vmUserShoppingData.lastStoreListPage) {
                return lvmUserShoppingData.astStoreListPage.$has('next');
            }
            return false;
        };

        function loadNextPage() {
            console.log('==>UserShoppingData.loadNextPage()');
            return new Promise(resolve => {
                vmUserShoppingData.lastStoreListPage
                .$get('next')
                .then( function(nextStoreList) {
                    console.log('get next page:', nextStoreList);
                    console.log('has next: ', nextStoreList.$has('next'));
                    vmUserShoppingData.lastStoreListPage = nextStoreList;
                    return nextStoreList.$get('shoppingStores');
                })
                .then( function(shoppingStores) {
                    console.log('==>UserReceiptData.loadNextPage(), get next shoppingStores:', shoppingStores);
                    shoppingStores.forEach( function(store) {
                        vmUserShoppingData.userShoppingStores.push(new Store(store));
                    });
                    resolve(vmUserShoppingData.userShoppingStores);
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
