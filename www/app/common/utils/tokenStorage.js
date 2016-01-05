(function () {
'use strict';

    angular
        .module('openprice.common')
        .factory('tokenStorage', tokenStorage);

    function tokenStorage() {
        var storageKey = 'openprice_auth_token';
        return {
            store : function(token) {
                if (token) {
                    localStorage.setItem(storageKey, token);
                }
            },
            retrieve : function() {
                return localStorage.getItem(storageKey);
            },
            clear : function() {
                return localStorage.removeItem(storageKey);
            }
        };
    };
})();
