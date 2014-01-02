
var queryize = require('../queryize');

exports['requirement'] = function (test) {
	test.strictEqual(typeof queryize, 'function', 'queryize is a function');
	test.done();
};

exports['compile without method throws error'] = function (test) {
	var q = queryize();

	test.throws(function () {
		q.compile();
	});

	test.done();
};

exports['compile without table throws error'] = function (test) {
	var q = queryize().select();

	test.throws(function () {
		q.compile();
	});

	test.done();
};
