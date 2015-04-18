'use sctrict';

var invoice = angular.module('invoice', [ 'ngMaterial' ]);

invoice.config([ '$mdThemingProvider', function ($mdThemingProvider) {
	$mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('blue-grey');
}]);

// Créer un filtre pour le numero de siret pour l'afficher joliement

invoice.directive('invoiceTotal', function () {
	return ({
		restrict : 'E',
		templateUrl : 'templates/invoice-total.html',
		scope : {
			items : '=toSum',
			opt : '=options'
		},
		link : function (scope, elem, attrs) {
			scope.subTotal = 0;
			scope.totalTva = 0;
			scope.total = 0;

			updateTotals = function (newValue) {
				scope.subTotal = 0;
				angular.forEach(scope.items, function (v, k) {
					scope.subTotal += v.unit * v.quantity;
				});
				scope.totalTva = scope.subTotal * scope.opt.tva / 100;
				scope.total = scope.subTotal + scope.totalTva;
			};

			scope.$watch(attrs.toSum, function (newValue) {
				scope.items = newValue;
				updateTotals();
			}, true);

			scope.$watch(attrs.options, function (newValue) {
				scope.opt = newValue;
				updateTotals();
			}, true);
		}
	});
});

invoice.controller('invoiceCtrl', [ '$scope', function ($scope) {
	var months = [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ];

	$scope.opt = {
		tva : 0,
		type : false,
		number : 1,
		startDate : new Date(),
		endDate : new Date(),
		paid : 0,
		devise : '€'
	};

 	// @TODO: cookies to save and init
	$scope.seller = {
		name : 'Nicolas BRIDOUX',
		siret : '09329329302032949293',
		address : '43 Rue denise',
		city : 'Bordeaux',
		zipcode : '33300',
		country : 'france'
	};

	$scope.items = [ ];

	$scope.client = $scope.seller;

	$scope.formatDate = function (date) {
		return (date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear());
	};

	$scope.calcLine = function (newItem) {
		var sum = parseInt(newItem.unit) * parseInt(newItem.quantity);

		sum += sum * ($scope.opt.tva / 100);
		return (sum + $scope.opt.devise);
	};

	$scope.genNewItem = function () {
		return ({
			description : '',
			unit : 0,
			quantity : 1,
		});
	}

	$scope.addItem = function (newItem) {
		$scope.items.push(angular.copy(newItem));
		$scope.newItem = $scope.genNewItem();
	};

	$scope.removeItem = function (item) {
		$scope.items.splice($scope.items.indexOf(item), 1);
	};

}]);