var angular = require('angular');
require('angular-touch');
var lazyload = require('angular-lazyload');

lazyload.initLoader(function(){

})

var app = module.exports = angular.module('ngfis-showcase', ['ngTouch']);

//配置期
app.config(['$routeProvider', function($routeProvider) {
  //Step4: add `controllerUrl` to your route item config
  $routeProvider
    .when('/menu', {
      id: 'modules/menu'
    })
    .when('/menu2', {
      id: 'modules/menu'
    })
    .when('/main', {
      controller: function($scope, $routeParams, $location){
        $scope.str = new Date()
        //console.log($routeParams,$location)
      },
      template: '<div>{{str}}</div>'
    })
    .otherwise({
      redirectTo: '/main'
    });
}
]);
