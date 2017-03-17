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
  var checkLoggedin = function($q, $http, $location, $rootScope){
    var deferred = $q.defer();
    $http.get('/loggedin').then(function(response){
      if (response.data !== '0') {
        $rootScope.showing = true;
        deferred.resolve();
      }
      else { 
        $rootScope.showing = false;        
        deferred.reject();
      } 
    }); 
    return deferred.promise; 
  };
  $routeProvider
    .when('/', { controller: 'MainCtrl', resolve: { loggedin: checkLoggedin }})
    
  $routeProvider.otherwise({ redirectTo: "/" });
  $locationProvider.html5Mode({ enabled: true, requireBase: false});
  $httpProvider.interceptors.push('loggedInterceptor');
}]);


app.controller('MainCtrl', ['$scope', '$http', function($scope, $http){
  $scope.items = [];
  $scope.clicked = false;
  var query;
  
  $scope.find = function() {
    query = $scope.query;
    $http.get('/find/' + query).then(function(response){
      $scope.items = response.data.bars;
      console.log(response.data)
      $scope.items.businesses.forEach(function(item, i){
        item.count = response.data.counts[i]
      })
    })
  }
  
  $scope.go = function (eventId, index) {
    if(!$scope.clicked){
      var evLog = {id: eventId, query: query};
      $http.post('/log', evLog).then(function(response){
        $scope.items.businesses[index].count = response.data;
        $scope.clicked = true;
      })
    } else {
      $http.delete('/log/' + eventId).then(function(response){
        $scope.items.businesses[index].count = response.data;
        $scope.clicked = false;
      })
    }
  }
}]);
