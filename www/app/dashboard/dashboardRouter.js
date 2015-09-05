(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

        $stateProvider
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
                        templateUrl: 'app/dashboard/home.html',
                        controller: 'homeController as vm'
                    }
                }
            })
            .state('app.dashboard.receiptItem', {
                url: '/home/:receiptId',
                views: {
                    'home-tab': {
                        templateUrl: 'app/dashboard/receiptItem.html',
                        controller: 'receiptItemController as vm'
                    }
                }
            })
            .state('app.dashboard.folders', {
                url: '/folders',
                views: {
                    'folders-tab': {
                        templateUrl: 'app/dashboard/folders.html',
                        controller: 'foldersController as vm'
                    }
                }
            })
            .state('app.dashboard.camera', {
                url: '/camera',
                views: {
                    'home-tab': {
                        templateUrl: 'app/dashboard/snap.html',
                        controller: 'snapController as vm'
                    }
                }
            })
            .state('app.dashboard.shoppinglist', {
                url: '/shoppinglist',
                views: {
                    'shoppinglist-tab': {
                        templateUrl: 'app/dashboard/shoppingList.html',
                        controller: 'shoppingListController as vm'
                    }
                }
            })
            .state('app.dashboard.store', {
                url: '/shoppinglist/:storeId',
                views: {
                    'shoppinglist-tab': {
                        templateUrl: 'app/dashboard/storeItems.html',
                        controller: 'storeItemsController as vm'
                    }
                }
            })
            .state('app.dashboard.friends', {
                url: '/friends',
                views: {
                    'friends-tab': {
                        templateUrl: 'app/dashboard/friends.html',
                        controller: 'friendsController as vm'
                    }
                }
            })
            ;

    };

})();
