require('shared/gameList');

var app = require('app');

app.controller('menuCtrl', function($scope, $http){
  $scope.str = 'menu';
});


exports.template = __inline('menu.tpl.html');
//exports.templateUrl = 'modules/shared/gameList';
//exports.templateUrl = require('modules/shared/gameList');