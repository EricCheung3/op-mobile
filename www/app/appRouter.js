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
                templateUrl: 'app/app-template.html'
            })
            ;

        $urlRouterProvider.otherwise('/');
    };

})();
