angular.module('mainCtrl', [])

  .controller('mainController', function($rootScope, $location, Auth) {

    var vm = this;
    vm.processing = true;
    vm.loggedIn = Auth.isLoggedIn();

    $rootScope.$on('$routeChangeStart', function() {
      vm.loggedIn = Auth.isLoggedIn();
      Auth.getUser()
        .then(function(response) {
          vm.user = response.data;
        });
    });

    //login
    vm.doLogin = function() {
      vm.processing = true;
      vm.error = '';

      Auth.login(vm.loginData.username, vm.loginData.password)
        .then(function(data) {
          console.log('Auth.login', data);
          vm.processing = false;
          if (data.success)
            $location.path('/game');
          else
            vm.error = data.message;

        });
    };
    //logout
    vm.doLogout = function() {
      Auth.logout();
      //vm.user = '';
      vm.user = {};

      $location.path('/login');
    };

    vm.createSample = function() {
      Auth.createSampleUser();
    };

  });