angular.module('addApp', ['ngRoute'])

.config(['$routeProvider',function($routeProvider) {
	$routeProvider.when('/addresses/page/:num', {
		templateUrl: '/app/views/display-new.html',
		controller: 'ViewController'
	}).when('/addresses/:id', {
		templateUrl: '/app/views/edit.html',
		controller: 'UpdateController'
	}).otherwise({
		redirectTo: '/addresses/page/1'
	});
}])

.run(['dataServices', function(dataServices){
	dataServices.initAddresses();
}])

.controller("appContentCtrl", ["$scope", "dataServices", function ($scope, dataServices) {


}])

.controller('ViewController', ['$scope', '$routeParams', 'dataServices', function($scope, $routeParams, dataServices){
	var itemsPerPage = 5,
		pageNo = $routeParams.num,
		totalPages = 0,
		startNo = (pageNo - 1) * itemsPerPage,
		addressesComplete = [];

	addressesComplete = dataServices.getAddresses();
	$scope.addresses = addressesComplete.slice(startNo, startNo + itemsPerPage);

	totalPages = Math.ceil(addressesComplete.length / itemsPerPage);

	$scope.arrForPageNos = [];
	for (var i = 1; i <= totalPages; i++) {
		$scope.arrForPageNos.push(i);
	}

	$scope.getClassName = function (num) {
		if (num == pageNo) {
			return "active";
		}
	};

	$scope.getPrevClassName = function () {
		if (pageNo <= 1) {
			return "disabled";
		}
	};

	$scope.getNextClassName = function () {
		if (pageNo >= totalPages) {
			return "disabled";
		}
	};


}])

.controller('UpdateController', ['$scope', '$routeParams', '$location', '$timeout', 'dataServices', function($scope, $routeParams, $location, $timeout, dataServices){
	var id = $routeParams.id,
		original = {};

	if (id === 'add') {
		id = -1;
	}

	id = parseInt(id);

	if (id === -1) {
		original.id = -1;
		$scope.dataInput = angular.copy(original);
	} else {
		$scope.showDeleteButton = true;
		$scope.dataInput = angular.copy(dataServices.getAddressById(id));
		original = angular.copy($scope.dataInput);
	}

	$scope.successStatus = false;

	$scope.save = function () {
		dataServices.saveAddress(id, angular.copy($scope.dataInput)).then(function (response) {
			$scope.successStatus = true;
			if (id === -1){
				$scope.statusMessage = 'A new address is successfully created!!';
			} else {
				$scope.statusMessage = 'The address is successfully saved!!';
			}

			$timeout(function () {
				//$scope.successStatus = false;
			}, 2500);
		});
	};

	$scope.delete = function (id) {
		dataServices.deleteAddress(id).then(function (response) {
			$scope.successStatus = true;
			$scope.statusMessage = 'The address is successfully removed!!';

			$timeout(function () {
				$scope.successStatus = false;
				$location.path('#addresses');
			}, 2500);
		})
	};

	$scope.reset = function () {
		$scope.dataInput = angular.copy(original);
		$scope.addressAddUpdateForm.$setPristine();
		$location.path('/addresses');
	};

}])

.directive('addressView', [function () {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			input: '=inputData',
			compact: '@'
		},
		templateUrl: '/app/views/address-view.html',
		link: function (scope, el) {
		}
	}
}])

.factory('dataServices', ['$http', function($http) {

	var inputDataTable = [];

	function getAddresses () {
		return inputDataTable;
	}

	function initAddresses () {
		$http({
			url: '/rest/addresses',
			method: 'GET'
		}).then(function (response) {
			inputDataTable = response.data;
		});
	}

	function deleteAddress(id) {
		var promise = $http({
			url: '/rest/addresses/' + id,
			method: 'DELETE'
		});

		promise.then(function () {
			for (var i = 0; i < inputDataTable.length; i++) {
				if (id == inputDataTable[i].id){
					inputDataTable.splice(i, 1);
					break;
				}
			}
		});

		return promise;
	}

	function getAddressById(id) {
		for (var i = 0; i < inputDataTable.length; i++) {
			if (id == inputDataTable[i].id){
				return inputDataTable[i];
			}
		}
	}

	function saveAddress(id, input) {

		var promise = $http({
			url: '/rest/addresses/' + id,
			method: (id === -1) ? 'POST' : 'PUT',
			data: input
		});

		promise.then(function (response) {
			if (id === -1) {
				inputDataTable.push(response.data);
			} else {
				for (var i = 0; i < inputDataTable.length; i++) {
					if (id == inputDataTable[i].id){
						inputDataTable[i] = response.data;
						break;
					}
				}
			}
		});

		return promise;
	}


	return {
		initAddresses: initAddresses,
		getAddresses: getAddresses,
		deleteAddress: deleteAddress,
		getAddressById: getAddressById,
		saveAddress: saveAddress
	};
}]);