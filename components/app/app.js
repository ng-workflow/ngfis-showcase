var angular = require('angular');
require('angular-lazyload');
require('angular-touch');
require('angular-route');


var app = module.exports = angular.module('ngfis-showcase', ['ngTouch']);

//lazyload.initLoader('single/ngRoute')

//配置期
//app.config(['$routeProvider', function($routeProvider) {
//  //Step4: add `controllerUrl` to your route item config
//  $routeProvider
//    .when('/menu', {})
//    .when('/menu/list', {
//      //id: 'modules/menu',
//      controller: 'menuCtrl'
//    })
//    .when('/menu1', {
//      //id: 'modules/menu',
//      controller: 'menuCtrl',
//      template: 'xxxx'
//    })
//    .when('/menu2', {
//      //id: 'modules/menu',
//      controller: 'menuCtrl',
//      templateUrl: 'ngfis-showcase/0.0.1/lib/shared/gameList/gameList.tpl.html'
//    })
//    .when('/main', {
//      //id: 'modules/menu',
//      //controller: 'menuCtrl'
//    })
//    //.when('/main', {
//    //  controller: function($scope, $routeParams, $location){
//    //    $scope.str = new Date()
//    //    //console.log($routeParams,$location)
//    //  },
//    //  template: '<div>{{str}}</div>'
//    //})
//    .otherwise({
//      redirectTo: '/main'
//    });
//  }
//]);

app.bootstrap();
//angular.bootstrap(document, [app.name]);
