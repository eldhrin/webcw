angular.module('authService', [])

  // ===================================================
  // auth factory to login and get information
  // inject $http for communicating with the API
  // inject $q to return promise objects
  // inject AuthToken to manage tokens
  // ===================================================
  .factory('Auth', function($http, $q, AuthToken) {

    // create auth factory object
    var authFactory = {};

    // log a user in
    authFactory.login = function(username, password) {
      return $http.post('/api/authenticate', {
          username: username,
          password: password
        })
        .then(function(data) {
          AuthToken.setToken(data.data.token);
          return data.data;
        });
    };

    authFactory.logout = function() {
      AuthToken.setToken();
    };

    authFactory.isLoggedIn = function() {
      if (AuthToken.getToken())
        return true;
      else
        return false;
    };


    authFactory.getUser = function() {
      if (AuthToken.getToken())
        return $http.get('/api/me', {
          cache: true
        });
      else
        return $q.reject({
          message: 'User has no token.'
        });
    };

    authFactory.createSampleUser = function() {
      $http.post('/api/sample');
    };
    return authFactory;

  })

  // ===================================================
  // factory for handling tokens
  // inject $window to store token client-side
  // ===================================================

  .factory('AuthToken', function($window) {

    var authTokenFactory = {};

    authTokenFactory.getToken = function() {
      return $window.localStorage.getItem('token');
    };
    authTokenFactory.setToken = function(token) {
      if (token)
        $window.localStorage.setItem('token', token);
      else
        $window.localStorage.removeItem('token');
    };

    return authTokenFactory;

  })

  .factory('AuthInterceptor', function($q, $location, AuthToken) {

    var interceptorFactory = {};
    interceptorFactory.request = function(config) {

      var token = AuthToken.getToken();
      if (token)
        config.headers['x-access-token'] = token;

      return config;
    };

    interceptorFactory.responseError = function(response) {

      if (response.status == 403) {
        AuthToken.setToken();
        $location.path('/login');
      }

      return $q.reject(response);
    };

    return interceptorFactory;

  });