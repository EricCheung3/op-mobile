(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider']

    function config(   $stateProvider,   $urlRouterProvider) {

        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'app/dashboard/app-template.html'
            })
            .state('app.dashboard', {
                url: '/dashboard',
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: 'app/dashboard/dashboard-template.html',
                        controller: 'dashboardController as vm'
                    }
                }
            })
            .state('app.dashboard.home', {
                url: '/home',
                views: {
                    'home-tab': {
                        templateUrl: 'app/home/home.html',
                        controller: 'homeController as vm'
                    }
                }
            })
            .state('app.dashboard.receiptItem', {
                url: '/home/:receiptId',
                views: {
                    'home-tab': {
                        templateUrl: 'app/receipts/receiptItem.html',
                        controller: 'receiptItemController as vm'
                    }
                }
            })
            .state('app.dashboard.folders', {
                url: '/folders',
                views: {
                    'folders-tab': {
                        templateUrl: 'app/folders/folders.html',
                        controller: 'foldersController as vm'
                    }
                }
            })
            .state('app.dashboard.camera', {
                url: '/camera',
                views: {
                    'home-tab': {
                        templateUrl: 'app/snapreceipts/snap.html',
                        controller: 'snapController as vm'
                    }
                }
            })
            .state('app.dashboard.shoppinglist', {
                url: '/shoppinglist',
                views: {
                    'shoppinglist-tab': {
                        templateUrl: 'app/shoppinglist/shoppingList.html',
                        controller: 'shoppingListController as vm'
                    }
                }
            })
            .state('app.dashboard.store', {
                url: '/shoppinglist/:storeId',
                views: {
                    'shoppinglist-tab': {
                        templateUrl: 'app/shoppinglist/storeItems.html',
                        controller: 'storeItemsController as vm'
                    }
                }
            })
            .state('app.dashboard.friends', {
                url: '/friends',
                views: {
                    'friends-tab': {
                        templateUrl: 'app/friends/friends.html',
                        controller: 'friendsController as vm'
                    }
                }
            })
            ;

        $urlRouterProvider.otherwise('/');
    };

})();
