'use sctrict';

var invoice = angular.module('invoice', [ 'ngMaterial', 'ngCookies', 'ngClipboard']);

invoice.config([ '$mdThemingProvider', 'ngClipProvider', function ($mdThemingProvider, ngClipProvider) {
	$mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('deep-orange');
	ngClipProvider.setPath("//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf");
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

				scope.subTotal = Math.round(scope.subTotal * 100) / 100;
				if (isNaN(scope.subTotal)) {
					scope.subTotal = 0;
				}
				scope.totalTva = Math.round((scope.subTotal * scope.opt.tva / 100) * 100) / 100;
				scope.total = Math.round((scope.subTotal + scope.totalTva) * 100) / 100;
			};

			scope.$watch(attrs.toSum, function (newValue) {
				scope.items = newValue;
				updateTotals();
			}, true);

			scope.$watch(attrs.options, function (newValue) {
				scope.opt = newValue;
				updateTotals();
			}, true);

			scope.round = function (value, decimals) {
				return (Number(Math.round(value+'e'+decimals)+'e-'+decimals));
			};
		}
	});
});

invoice.controller('invoiceCtrl', [ '$scope', '$cookies', '$mdToast', function ($scope, $cookies, $mdToast) {

	$scope.formatDate = function (date) {
		return (date.getDate() + ' ' + months[date.getMonth() - 1] + ' ' + date.getFullYear());
	};

	$scope.calcLine = function (newItem) {
		var sum = parseFloat(newItem.unit) * parseInt(newItem.quantity);

		sum += sum * ($scope.opt.tva / 100);
		sum = Math.round(sum * 100) / 100;
		if (isNaN(sum)) {
			sum = 0;
		}
		return (sum + $scope.opt.devise);
	};

	$scope.genNewItem = function () {
		return ({
			description : '',
			unit : 0,
			quantity : 1,
		});
	};

	$scope.genNewClient = function () {
		return ({
			name : '',
			siret : '',
			address : '',
			city : '',
			zipcode : '',
			country : ''
		});
	};

	$scope.addItem = function (newItem) {
		$scope.items.push(angular.copy(newItem));
		$scope.newItem = $scope.genNewItem();
	};

	$scope.removeItem = function (item) {
		$scope.items.splice($scope.items.indexOf(item), 1);
	};

	$scope.print = function () {
		$cookies.seller = JSON.stringify($scope.seller);
		window.print();

		$mdToast.show({
			controller: 'toastCtrl',
			templateUrl: 'templates/toast-keep-template.html',
			hideDelay: 7000,
			position: 'bottom left'
		});
	};

	$scope.informClip = function (copied) {
		$mdToast.show({
			controller: 'toastCtrl',
			templateUrl: 'templates/toast-copy-template.html',
			hideDelay: 7000,
			position: 'bottom left'
		});
	};

	var months = [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ];

	$scope.items = [ ];
	$scope.newItem = $scope.genNewItem();
	$scope.client = $scope.genNewClient();
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
		$scope.seller = JSON.parse($cookies.seller);
	} catch (e) {
		$scope.seller = {
			name : 'Nicolas BRIDOUX',
			siret : '81006118400018',
			address : '44 Cours de la Martinique',
			city : 'Bordeaux',
			zipcode : '33000',
			country : 'france'
		};
	}

}]);

invoice.controller('toastCtrl', [ '$scope', '$mdToast', function($scope, $mdToast) {
	$scope.closeToast = function() {
    	$mdToast.hide();
	};
}]);
