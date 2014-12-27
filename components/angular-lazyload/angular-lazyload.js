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
  angular.module('angular-lazyload', [], ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
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
      //返回已定义的模块
      return origMethod(name);
    }else{
      //声明模块
      requires.unshift('angular-lazyload');
      var m = origMethod(name, requires, configFn);
      initHooks(m);
      initTemplate(m);
      initRoute(m, requires);
      return m;
    }
  };

  function initHooks(app){
    app.run(['$lazyload', function($lazyload){
      var hooks = $lazyload;
      for (var key in hooks) {
        if (hooks.hasOwnProperty(key)) {
          app[key] = hooks[key];
        }
      }
    }]);
  }

  function initTemplate(app){
    var cacheHolder;
    app.run(["$templateCache", function($templateCache) {
      cacheHolder = $templateCache;
    }]);

    app.template = function(id, content){
      if(cacheHolder){
        cacheHolder.put(id, content);
      }else{
        var script = document.createElement("script");
        script.type = 'text/ng-template';
        script.id = id;
        script.innerHTML = content;
        document.body.appendChild(script);
      }
    };
  }

  function initRoute(app, requires){
    if(requires.indexOf('ngRoute') !== -1){
      //app.config(['$routeProvider', function($routeProvider){
      //  var origMethod = angular.bind($routeProvider, $routeProvider.when);
      //  $routeProvider.when = function(path, route){
      //    route = route || {};
      //    if(!route.controller && path){
      //      route.controller = path.toLowerCase().replace(/\/(.)/g, function(m, g){return g.toUpperCase();}) + 'Ctrl';
      //    }
      //    if(typeof route.controller === 'string') {
      //      var moduleId = route.id || route.moduleId || ('modules/' + route.controller.replace(/Ctrl$/, '').replace(/([A-Z])/g, function(m){return "/" + m.toLowerCase();}));
      //      route.resolve = route.resolve || {};
      //
      //      var templateDefer;
      //
      //      route.resolve.$module = ['$q', '$timeout', '$route', function ($q, $timeout, $route) {
      //        var defer = $q.defer();
      //        templateDefer = $q.defer();
      //        console.log('require:', moduleId)
      //        require.async(moduleId, function(m){
      //          console.log(m)
      //          $timeout(function(){
      //            if(m.template){
      //              //route.locals.$template = m.template;
      //              templateDefer.resolve(m.template);
      //            }
      //            defer.resolve(m);
      //          });
      //        });
      //        return defer.promise;
      //      }];
      //      if(!route.template && !route.templateUrl){
      //        route.resolve.$template = function(){
      //          return templateDefer.promise;
      //        };
      //      }
      //    }
      //    return origMethod.call($routeProvider, path, route);
      //  }
      //}]);

      app.run(['$rootScope', '$q', '$timeout', function($rootScope, $q, $timeout){
        $rootScope.$on('$routeChangeSuccess', function(e, target){
          console.debug('$routeChangeSuccess', e, target);
        });
        //listen to route change event to hook
        $rootScope.$on('$routeChangeStart', function(e, target) {
          //console.debug(e, '|', target);
          var route = target && target.$$route;
          if(route){
            //controller not define, /menu/list -> menuListCtrl
            if(!route.controller && route.originalPath) {
              route.controller = camelCase(route.originalPath) + 'Ctrl';
            }
            //controller is string
            if(typeof route.controller === 'string') {
              var moduleId = route.id || route.moduleId || ('modules/' + pathCase(route.controller.replace(/Ctrl$/, '').replace(/^\//, '')));
              route.resolve = route.resolve || {};

              var moduleDefer = $q.defer();
              var templateDefer = $q.defer();

              //load module promise
              route.resolve.$module = ['$timeout', function ($timeout) {
                require.async(moduleId, function (m){
                  //$timeout(function(){
                    templateDefer.resolve(m && m.template);
                    moduleDefer.resolve(m);
                  //});
                });
                return moduleDefer.promise;
              }];

              //template promise
              if(!route.template && !route.templateUrl){
                route.resolve.$template = function(){
                  return templateDefer.promise;
                };
              }
            }
          }
        });
      }]);
    }else{

    }
  }

  function camelCase(path){
    return path.toLowerCase().replace(/^\//, '').replace(/\/(.)/g, function (m, g) {
      return g.toUpperCase();
    });
  }

  function pathCase(str){
    return str.replace(/([A-Z])/g, function(m){
      return "/" + m.toLowerCase();
    });
  }

})(this);