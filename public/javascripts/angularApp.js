var app = angular.module('nightlife', ['ngResource', 'ngRoute']);

app.factory('loggedInterceptor', ['$rootScope', '$q', '$location', function($rootScope, $q, $location) {
  return { 
    responseError: function(response) { 
      if (response.status === 401){
        $location.url('/login');
        return $q.reject(response);
      }
      else
        return $q.reject(response); 
    } 
  };
}]);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {

  $routeProvider
    .when('/', { controller: 'MainCtrl' })
    
  $routeProvider.otherwise({ redirectTo: "/" });
  $locationProvider.html5Mode({ enabled: true, requireBase: false});
  $httpProvider.interceptors.push('loggedInterceptor');
}]);


app.controller('MainCtrl', ['$scope', '$q', '$http', '$rootScope', function($scope, $q, $http, $rootScope){
  $scope.items = {}
  $scope.find = function() {
    $http.get('/find/' + $scope.query).then(function(response){
      $scope.items = response.data;
      console.log($scope.items);
    })
  }
}]);
