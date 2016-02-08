(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

		$stateProvider
            .state('app.dashboard', {
                url: '/dashboard',
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: 'app/dashboard/dashboard.tmpl.html',
                        controller: 'DashboardController as vm'
                    }
                }
            })
            .state('app.dashboard.stores', {
                url: '/shoppingstores',
                cache: false,
                views: {
                    'shoppinglist-tab': {
                        templateUrl: 'app/shoppinglist/list-stores.tmpl.html',
                        controller: 'StoreListController as vm'
                    }
                }
            })
            .state('app.dashboard.store', {
                url: '/shoppingstores/:storeId',
                cache: true,
                views: {
                    'shoppinglist-tab': {
                        templateUrl: 'app/shoppinglist/store-shoppinglist.tmpl.html',
                        controller: 'StoreShoppingListController as vm'
                    }
                }
            })
            .state('app.dashboard.receipts', {
                url: '/receipts',
                cache: false,
                views: {
                    'receipt-tab': {
                        templateUrl: 'app/receipts/timeline.tmpl.html',
                        controller: 'TimelineController as vm'
                    }
                }
            })
            .state('app.dashboard.receipt', {
                url: '/receipts/:receiptId',
                cache: false,
                views: {
                    'receipt-tab': {
                        templateUrl: 'app/receipts/display-receipt.tmpl.html',
                        controller: 'ReceiptDisplayController as vm'
                    }
                }
            })
            .state('app.dashboard.snap', {
                url: '/snap',
                cache: false,
                views: {
                    'snap-tab': {
                        // templateUrl: 'app/receipt-snap/snap.tmpl.html',
                        controller: 'SnapController as vm'
                    }
                }
            })
            .state('app.dashboard.crop', {
                url: '/crop',
                cache: false,
                views: {
                    'crop-tab': {
                        // templateUrl: 'app/receipt-crop/crop.tmpl.html',
                        controller: 'CropController as vm'
                    }
                }
            })
            // .state('app.dashboard.shoppingMode', {
            //     url: '/shoppingMode',
            //     views: {
            //         'shoppinglist-tab': {
            //             templateUrl: 'app/shopping-mode/shoppingMode.html',
            //             controller: 'shoppingModeController as vm'
            //         }
            //     }
            // })
            .state('app.dashboard.friends', {
                url: '/friends',
                views: {
                    'friends-tab': {
                        templateUrl: 'app/friends/friends.tmpl.html',
                        controller: 'FriendsController as vm'
                    }
                }
            })
            .state('app.dashboard.folders', {
                url: '/folders',
                views: {
                    'folders-tab': {
                        templateUrl: 'app/folders/folders.tmpl.html',
                        controller: 'FoldersController as vm'
                    }
                }
            })
            .state('app.dashboard.upload', {
                url: '/upload',
                views: {
                    'upload-tab': {
                        templateUrl: 'app/upload/upload.tmpl.html',
                        controller: 'UploadController as vm'
                    }
                }
            })
            ;

	};

})();
