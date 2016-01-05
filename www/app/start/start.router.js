(function() {
'use strict';

	angular
	    .module('openprice.mobile')
	    .config(config);

	config.$inject = ['$stateProvider', '$urlRouterProvider'];

	function config(   $stateProvider,   $urlRouterProvider) {

		$stateProvider
            .state('start', {
                url: '/',
                templateUrl: 'app/start/start.tmpl.html',
                controller : 'startController as vm'
            })
            ;

	};

})();
