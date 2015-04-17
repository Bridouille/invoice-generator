'use sctrict';

var invoice = angular.module('invoice', [ 'ngMaterial' ]);

invoice.controller('invoiceCtrl', [ '$scope', function ($scope) {
	$scope.opt = {
		tva : 0,
		type : false,
		number : 1,
		startDate : new Date(),
		endDate : new Date()
	};

	

}]);