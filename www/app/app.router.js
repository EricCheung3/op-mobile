(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider']

    function config(   $stateProvider,   $urlRouterProvider) {

        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'app/app.tmpl.html'
            })
            ;

        $urlRouterProvider.otherwise('/');
    };

})();
