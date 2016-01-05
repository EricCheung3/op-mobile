(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

		$stateProvider
            .state('login', {
                cache: false,
                url: '/login',
                templateUrl: 'app/authentication/login/login.tmpl.html',
                controller : 'LoginController as vm'
            })
            ;

	};

})();
