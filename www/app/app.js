
(function() {
    'use strict';

    angular.module('openprice.mobile', [
        'ionic',
        'ngMessages',
        'ngMaterial',
        'angular-hal',
        'base64',
        'ngCordova',
        'ionic.service.core',
        'angularFileUpload',
        'openprice.common',
        'openprice.config',
        'ion-autocomplete',
        'ngOpenFB' // fb login
    ])
    .config(function($httpProvider, $ionicConfigProvider, $mdThemingProvider, $mdGestureProvider) {
        $httpProvider.interceptors.push('tokenAuthInterceptor');

        // set tabs or nav-bar position
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('bottom');
        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');
        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');

        $ionicConfigProvider.backButton.text('').previousTitleText('').icon('ion-ios-arrow-thin-left');

        $mdThemingProvider.theme('default');
        $mdGestureProvider.skipClickHijack();
    });

}());
