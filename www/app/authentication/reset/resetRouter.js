(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

		$stateProvider
            .state('reset', {
                cache: false,
                url: '/reset',
                templateUrl: 'app/authentication/reset/reset.tmpl.html',
                controller : 'resetController as vm'
            })
            ;

	};

})();
