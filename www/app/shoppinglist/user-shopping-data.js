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
        vmUserShoppingData.categoryList = CATEGORY_LIST;
        vmUserShoppingData.storeList;

        return {
            'categoryList' : categoryList,
            'storeList' : storeList,
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

            return new Promise( function(resolve) {
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

        function storeList (query) {
            return new Promise( function(resolve) {
                apiService
                .getUserResource()
                .then(function (userResource) {
                    return userResource.$get('searchStores', {query:query})
                })
                .then( function(stores) {
                    vmUserShoppingData.storeList = stores;
                    resolve(vmUserShoppingData.storeList);
                });
            });
        };

        function loadFirstPage() {
            console.log('==>UserShoppingData.loadFirstPage()');
            vmUserShoppingData.userShoppingStores = [];
            return new Promise( function(resolve) {
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
                return vmUserShoppingData.lastStoreListPage.$has('next');
            }
            return false;
        };

        function loadNextPage() {
            console.log('==>UserShoppingData.loadNextPage()');
            return new Promise( function(resolve) {
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
            return new Promise( function(resolve) {
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

    var CATEGORY_LIST =
[
  {
    "label": "Apparel",
    "code": "apparel"
  },
  {
    "label": "Baby Food",
    "code": "babyfood"
  },
  {
    "label": "Baby Items",
    "code": "babyitems"
  },
  {
    "label": "Bakery",
    "code": "bakery"
  },
  {
    "label": "Baking",
    "code": "baking"
  },
  {
    "label": "Beverages",
    "code": "beverages"
  },
  {
    "label": "Canned & Packaged",
    "code": "canned"
  },
  {
    "label": "Breakfast & Cereal",
    "code": "cereal"
  },
  {
    "label": "Cleaning Supplies",
    "code": "cleaningsupplies"
  },
  {
    "label": "Dairy & Egg",
    "code": "dairy"
  },
  {
    "label": "Deli",
    "code": "deli"
  },
  {
    "label": "Entertainment",
    "code": "entertainment"
  },
  {
    "label": "Floral",
    "code": "floral"
  },
  {
    "label": "Frozen",
    "code": "frozen"
  },
  {
    "label": "Fruits",
    "code": "fruit"
  },
  {
    "label": "Beans, Grains & Rice",
    "code": "grains"
  },
  {
    "label": "Health & Beauty",
    "code": "health"
  },
  {
    "label": "Home",
    "code": "home"
  },
  {
    "label": "International & Ethnic",
    "code": "international"
  },
  {
    "label": "Jams & Preserves",
    "code": "jams"
  },
  {
    "label": "Meat",
    "code": "meat"
  },
  {
    "label": "Nuts & Dried Fruit",
    "code": "nuts"
  },
  {
    "label": "Oil & Vinegar",
    "code": "oil"
  },
  {
    "label": "Paper Goods",
    "code": "papergoods"
  },
  {
    "label": "Pasta & Noodles",
    "code": "pasta"
  },
  {
    "label": "Personal Care",
    "code": "personalitems"
  },
  {
    "label": "Pet Food",
    "code": "petfood"
  },
  {
    "label": "Pharmacy",
    "code": "pharmacy"
  },
  {
    "label": "Condiments & Sauces",
    "code": "sauces"
  },
  {
    "label": "Seafood",
    "code": "seafood"
  },
  {
    "label": "Snacks",
    "code": "snacks"
  },
  {
    "label": "Soups & Broth",
    "code": "soup"
  },
  {
    "label": "Spices",
    "code": "spices"
  },
  {
    "label": "Uncategorized",
    "code": "uncategorized"
  },
  {
    "label": "Vegetables",
    "code": "vegetables"
  },
  {
    "label": "Wine & Spirits",
    "code": "wine"
  }
];

})();
