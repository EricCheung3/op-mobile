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
                url: '/resetPassword/:id',
                templateUrl: 'app/authentication/reset/reset.tmpl.html',
                controller : 'resetController as vm'
            })
            ;

	};

})();
