angular.module('app.routes', ['ngRoute'])

  .config(function($routeProvider, $locationProvider) {

    $routeProvider

      // route for the home page
      .when('/', {
        templateUrl: 'app/views/pages/home.html'
      })

      // login page
      .when('/login', {
        templateUrl: 'app/views/pages/login.html',
        controller: 'mainController',
        controllerAs: 'login'
      })

      // game page
      .when('/game', {
        templateUrl: 'app/views/pages/game.html'
      })

      // form to create a new user
      // same view as edit page
      .when('/users/create', {
        templateUrl: 'app/views/pages/users/single.html',
        controller: 'userCreateController',
        controllerAs: 'user'
      })

      // page to edit a user
      .when('/users/:user_id', {
        templateUrl: 'app/views/pages/users/single.html',
        controller: 'userEditController',
        controllerAs: 'user'
      })


    $locationProvider.html5Mode(true);

  });