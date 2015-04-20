'use sctrict';

var invoice = angular.module('invoice', [ 'ngMaterial', 'ngCookies' ]);

invoice.config([ '$mdThemingProvider', function ($mdThemingProvider) {
	$mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('blue-grey');
}]);


invoice.filter('siret', function () {
	return (function (input) {
		return (input.slice(0, 3) + " " + input.slice(3, 6) + " " + input.slice(6, 9) + " " + input.slice(9, 14));
	});
});

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

// Arrondir les resultats au 100ème
// Print CSS
// responsive CSS

invoice.controller('invoiceCtrl', [ '$scope', '$mdBottomSheet', '$cookies', function ($scope, $mdBottomSheet, $cookies) {
	var months = [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ];

	$scope.items = [ ];
	$scope.opt = {
		tva : 0,
		type : false,
		number : 1,
		startDate : new Date(),
		endDate : new Date(),
		paid : 0,
		devise : '€'
	};

	try {
		$scope.seller = JSON.parse($cookies['seller']);
	} catch (e) {
		$scope.seller = {
			name : 'Nicolas BRIDOUX',
			siret : '01234567890123456789',
			address : '44 Cours de la Martinique',
			city : 'Bordeaux',
			zipcode : '33300',
			country : 'france'
		};
	}

	$scope.formatDate = function (date) {
		return (date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear());
	};

	$scope.calcLine = function (newItem) {
		var sum = parseInt(newItem.unit) * parseInt(newItem.quantity);

		sum += sum * ($scope.opt.tva / 100);
		sum = Math.round(sum * 100) / 100;
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

	$scope.showOptions = function ($event) {
		$mdBottomSheet.show({
	      templateUrl: 'templates/options.html',
	      controller: 'bottomSheetCtrl',
	      scope: $scope,
	      preserveScope: true,
	      targetEvent: $event
	    });
	};

	$scope.print = function () {
		$cookies['seller'] = JSON.stringify($scope.seller);
		window.print();
	};

}]);

invoice.controller('bottomSheetCtrl', [ '$scope', function ($scope) {

}]);
