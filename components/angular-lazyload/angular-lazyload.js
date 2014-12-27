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

  var origMethod = angular.bind(angular, angular.module);
  angular.module = function(name, requires, configFn){
    if(!requires){
      //返回已定义的模块
      return origMethod(name);
    }else{
      //声明模块
      var m = origMethod(name, requires, configFn);
      initHooks(m);
      initTemplate(m);
      if(requires.indexOf('ngRoute') !== -1) {
        initRoute(m);
      }
      return m;
    }
  };

  /**
   * override hooks(controller/service/...) to support dynamic register
   */
  function initHooks(app){
    var hooks = {};
    app.config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
      //hold provide's refs, because after ng bootstrap, you can't use `app.controller` to dynamic register controller.
      hooks = {
        controller: $controllerProvider.register,
        directive: $compileProvider.directive,
        filter: $filterProvider.register,
        factory: $provide.factory,
        service: $provide.service,
        decorator: $provide.decorator
      };
    }]);

    app.run(function(){
      for (var key in hooks) {
        if (hooks.hasOwnProperty(key)) {
          app[key] = hooks[key];
        }
      }
    });
  }

  /**
   * add `app.template(id, content)` interface
   */
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

  /**
   * support dynamic loading for ngRoute
   */
  function initRoute(app){
    app.run(['$rootScope', '$q', '$timeout', function($rootScope, $q, $timeout){
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

      $rootScope.$on('$routeChangeError', function(nextRoute, lastRoute, error){
        console.error('$routeChangeError', nextRoute, lastRoute, error);
      });
    }]);
  }

  /**
   * change `/menu/list` -> 'menuList'
   */
  function camelCase(path){
    return path.toLowerCase().replace(/^\//, '').replace(/\/(.)/g, function (m, g) {
      return g.toUpperCase();
    });
  }

  /**
   * change 'menuList' -> `/menu/list`
   */
  function pathCase(str){
    return str.replace(/([A-Z])/g, function(m){
      return "/" + m.toLowerCase();
    });
  }

})(this);