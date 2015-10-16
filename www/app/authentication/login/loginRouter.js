(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

		$stateProvider
            .state('login', {
                cache: false,
                url: '/login',
                templateUrl: 'app/authentication/login/login.html',
                controller : 'loginController as vm'
            })
            ;

	};

})();
