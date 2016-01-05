(function() {
'use strict';

    angular
        .module('openprice.mobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

        $stateProvider
            .state('register', {
                url: '/register',
                templateUrl: "app/authentication/register/registration.tmpl.html",
                controller: 'RegistrationController as vm'
            })
            ;

    };

})();
