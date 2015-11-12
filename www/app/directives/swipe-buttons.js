(function(ionic) {
    'use strict';


    var ITEM_TPL_OPTION_BUTTONS =
        '<div class="item-options invisible">' +
        '</div>' + '<div class="item-options-left invisible">' +
        '</div>';

    angular
      .module('openpriceMobile')
      .directive('ionOptionButtons', [function() {
        function stopPropagation(e) {
          e.stopPropagation();
        }
        return {
          restrict: 'E',
          require: '^ionItem',
          priority: Number.MAX_VALUE,
          compile: function($element, $attr) {
            $attr.$set('class', ($attr['class'] || '') + ' button', true);
            return function($scope, $element, $attr, itemCtrl) {
              if (!itemCtrl.optionsContainer) {
                itemCtrl.optionsContainer = angular.element(ITEM_TPL_OPTION_BUTTONS);
                itemCtrl.$element.append(itemCtrl.optionsContainer);
              }
              //[NEW] if it as an attribute side = 'left' put the button in the left container
              if ($attr.side === 'left') {
                  angular.element(itemCtrl.optionsContainer[1]).append($element);
                  itemCtrl.$element.addClass('item-left-editable');
              } else{
                  angular.element(itemCtrl.optionsContainer[0]).append($element);
                  itemCtrl.$element.addClass('item-right-editable');
              }
              //Don't bubble click up to main .item
              $element.on('click', stopPropagation);
            };
          }
        };
      }])
      .controller('$ionicList', [
        '$scope',
        '$attrs',
        '$ionicListDelegate',
        '$ionicHistory',
        function($scope, $attrs, $ionicListDelegate, $ionicHistory) {
          var self = this;
          //[NEW] object with can-swipe attr and swipe-direction side attr, default direction is left
          var swipe = {
              isSwipeable: true,
              side: 'left'
          };
          var isReorderShown = false;
          var isDeleteShown = false;


          var deregisterInstance = $ionicListDelegate._registerInstance(
            self, $attrs.delegateHandle, function() {
              return $ionicHistory.isActiveScope($scope);
            }
          );
          $scope.$on('$destroy', deregisterInstance);

          self.showReorder = function(show) {
            if (arguments.length) {
              isReorderShown = !!show;
            }
            return isReorderShown;
          };

          self.showDelete = function(show) {
            if (arguments.length) {
              isDeleteShown = !!show;
            }
            return isDeleteShown;
          };

          //[NEW] get swipe direction attribute and store it in a variable to access in other function
          self.canSwipeItems = function (can) {
              if (arguments.length) {
                  swipe.isSwipeable = !!can;
                  swipe.side = $attrs.swipeDirection;
              }
              return swipe;
          };

          self.closeOptionButtons = function() {
            self.listView && self.listView.clearDragEffects();
          };
        }]);

})();
