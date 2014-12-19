(function(global, undefined) {
  'use strict';
  var angular;

  //依赖处理, 兼容不同模块化规范
  if (typeof module !== 'undefined' && module.exports) {
    angular = require('angular');
    module.exports = angular;
  } else {
    angular = global['angular'];
  }

  if (!angular) {
    throw new Error('Missing angular');
  }

  /**
   * register `angular-lazyload` module & `$lazyload` service
   */
  var app = angular.module('angular-lazyload', [], ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
      //register `$lazyload` service
      $provide.factory('$lazyload', ['$rootScope', '$q', function($rootScope, $q){
        //hold provide's refs, because after ng bootstrap, you can't use `app.controller` to dynamic register controller.
        var hooks = {
          controller: $controllerProvider.register,
          directive: $compileProvider.directive,
          filter: $filterProvider.register,
          factory: $provide.factory,
          service: $provide.service,
          decorator: $provide.decorator
        };
        return hooks;
        //return new LazyLoadProvider($rootScope, $q, register);
      }]);
    }
  ]);

  var origMethod = angular.bind(angular, angular.module);
  angular.module = function(name, requires, configFn){
    if(!requires){
      return origMethod(name);
    }else{
      requires.unshift('angular-lazyload');
      initRoute();
      var m = origMethod(name, requires, configFn);
      m.run(['$lazyload', function($lazyload){
        var hooks = $lazyload;
        for (var key in hooks) {
          if (hooks.hasOwnProperty(key)) {
            m[key] = hooks[key];
          }
        }
      }]);
      return m;
    }
  };

  function initRoute(requires){
    if(requires.indexOf('ngRoute') !== -1){
      app.run(['$rootScope', '$q', '$timeout', function($rootScope, $q, $timeout){
        //listen to route change event to hook
        $rootScope.$on('$routeChangeStart', function(e, target) {
          //console.debug(e, '|', target);
          var route = target && target.$$route;
          if (route) {
            route.resolve = route.resolve || {};
            route.resolve.loadedModule = function(){
              var defer = $q.defer();
              loader.load(route, function(m){
                $timeout(function(){
                  defer.resolve(m);
                });
              }, function(m){
                $timeout(function(){
                  defer.reject(m);
                });
              });
              return defer.promise;
            }
          }
        });
      }]);
    }
  }

})(this);