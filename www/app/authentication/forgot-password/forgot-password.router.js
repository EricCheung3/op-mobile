(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

        $stateProvider
            .state('forgot', {
                cache: false,
                url: '/forgot',
                templateUrl: 'app/authentication/forgot-password/forgot-password.tmpl.html',
                controller : 'ForgotPasswordController as vm'
            })
            ;

    };

})();
