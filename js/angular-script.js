angular.module('sguide', ['ui.bootstrap']);
/**
 * Debugging Tools
 *
 * Allows you to execute debug functions from the view
 */



angular.module('sguide').controller('ButtonsCtrl', function ($scope, $rootScope) {

    $scope.singleModel = 1;

    $scope.radioModel = 'Middle';

    $scope.checkModel = {
        left: false,
        middle: true,
        right: false
    };

    $rootScope.log = function(variable) {
        console.log(variable);
    };
    $rootScope.alert = function(text) {
        alert(text);
    };
});

angular.module('sguide').directive('kcdRecompile', function($compile, $parse) {
    'use strict';
    return {
        scope: true, // required to be able to clear watchers safely
        compile: function(el) {
            var template = getElementAsHtml(el);
            return function link(scope, $el, attrs) {
                var stopWatching = scope.$parent.$watch(attrs.kcdRecompile, function(_new, _old) {
                    var useBoolean = attrs.hasOwnProperty('useBoolean');
                    if ((useBoolean && (!_new || _new === 'false')) || (!useBoolean && (!_new || _new === _old))) {
                        return;
                    }
                    // reset kcdRecompile to false if we're using a boolean
                    if (useBoolean) {
                        $parse(attrs.kcdRecompile).assign(scope.$parent, false);
                    }

                    // recompile
                    var newEl = $compile(template)(scope.$parent);
                    $el.replaceWith(newEl);

                    // Destroy old scope, reassign new scope.
                    stopWatching();
                    scope.$destroy();
                });
            };
        }
    };

    function getElementAsHtml(el) {
        return angular.element('<a></a>').append(el.clone()).html();
    }
});

