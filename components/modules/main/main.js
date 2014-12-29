require('shared/gameList');

var app = require('app');
console.log('main')
app.controller('mainCtrl', function($scope, $http){
  $scope.str = 'main'
});


exports.template = __inline('main.tpl.html');
//exports.template = require('modules/menu').template + 'xxx'
//exports.templateUrl = 'shared/gameList';
//exports.templateUrl = require('modules/shared/gameList');