(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

		$stateProvider
            .state('forgot', {
                cache: false,
                url: '/forgot',
                templateUrl: 'app/authentication/forgot/forgot.tmpl.html',
                controller : 'forgotController as vm'
            })
            ;

	};

})();
