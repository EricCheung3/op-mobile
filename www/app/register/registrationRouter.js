(function() {
'use strict';

    angular
        .module('openpriceMobile')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config(   $stateProvider,   $urlRouterProvider) {

        $stateProvider
            .state('register', {
                url: '/register',
                templateUrl: "app/register/registration.html",
                controller: 'registrationController as vm'
            })
            ;

    };

})();
