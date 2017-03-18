var app = angular.module('nightlife', ['ngResource', 'ngRoute', 'ngCookies']);

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
    .otherwise({ redirectTo: "/" });
  $locationProvider.html5Mode({ enabled: true, requireBase: false});
}]);


app.controller('MainCtrl', ['$scope', '$http', '$route', '$cookies', function($scope, $http, $route, $cookies){
  $scope.items = [];
  var query;
  
  function search(q) {
    $http.get('/find/' + q).then(function(response){
      $scope.items = response.data.bars;
      $scope.items.businesses.forEach(function(item, i){
        item.count = response.data.counts[i];
        if(response.data.userEv) {
          item.userEv = response.data.userEv.some(function (ev) {
            return item.id === ev.idEvent;
          })
        }
      })
    })
  }
  
  var cookie = $cookies.getObject('savedQuery');
  if(cookie) {
    $scope.query = query = cookie;
    search(query);
  }
  
  $scope.find = function() {
    query = $scope.query;
    var today = new Date();
    var expiresValue = new Date(today);
    expiresValue.setMinutes(today.getMinutes() + 5); 
    $cookies.putObject('savedQuery', query, { 'expires': expiresValue });
    search(query);
  }
  
  $scope.go = function (eventId, index) {
    var evLog = {id: eventId, query: query};
    $http.post('/checkLog', evLog).then(function(response) {
      $scope.items.businesses[index].count = response.data.evLength;
      $scope.items.businesses[index].userEv = response.data.userEv;
      $route.reload();
    })
  }

}]);
