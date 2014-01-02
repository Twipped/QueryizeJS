
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

exports['basic select, copied'] = function (test) {
	var a = queryize().select().from('users', 'u');

	var b = queryize(a);
		
	test.deepEqual(b.compile(), {
		query: 'SELECT * FROM `users` u',
		data: []
	});

	test.done();
};