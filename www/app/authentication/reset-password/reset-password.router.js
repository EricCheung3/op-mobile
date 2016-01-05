(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

		$stateProvider
            .state('reset', {
                cache: false,
                url: '/resetPassword/:id',
                templateUrl: 'app/authentication/reset-password/reset-password.tmpl.html',
                controller : 'ResetPasswordController as vm'
            })
            ;

	};

})();
