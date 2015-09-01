(function() {
'use strict';

	angular
	    .module('openpriceMobile')
	    .config(config);

	config.$inject = ['$stateProvider', '$urlRouterProvider'];

	function config(   $stateProvider,   $urlRouterProvider) {

		$stateProvider
            .state('start', {
                url: '/',
                templateUrl: 'app/start/start.html',
                controller : 'startController as vm'
            })
            ;

	};

})();
