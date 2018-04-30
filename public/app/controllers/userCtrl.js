angular.module('userCtrl', ['userService'])

  .controller('userCreateController', function(User) {

    var vm = this;

    vm.type = 'create';

//create
    vm.saveUser = function() {
      vm.processing = true;
      vm.message = '';

      User.create(vm.userData)
        .then(function(data) {
          vm.processing = false;
          vm.userData = {};
          vm.message = data.message;
        });

    };

  });