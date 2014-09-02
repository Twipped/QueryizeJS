
var queryize = require('../queryize');

exports['delete without where throws error'] = function (test) {
	var q = queryize().delete().from('users', 'u');
	
	test.throws(function () {
		q.compile();
	});

	test.done();
};

exports['basic delete'] = function (test) {
	var q = queryize().delete().from('users', 'u');
	
	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: []
	});

	test.done();
};

exports['basic delete with database'] = function (test) {
	var q = queryize().delete().fromDatabase('test', 'users', 'u');
		
	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'DELETE FROM `test`.`users` u WHERE id = 1',
		data: []
	});

	test.done();
};

exports['basic delete using deleteFrom'] = function (test) {
	var q = queryize().deleteFrom('users', 'u');
	
	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: []
	});

	test.done();
};
