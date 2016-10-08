
var test = require('tap').test;
var queryize = require('../');

test('delete without where throws error', (test) => {
	var q = queryize().delete().from('users', 'u');

	test.throws(function () {
		q.compile();
	});

	test.end();
});

test('basic delete', (test) => {
	var q = queryize().delete().from('users', 'u');

	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: []
	});

	test.end();
});

test('basic delete with database', (test) => {
	var q = queryize().delete().fromDatabase('test', 'users', 'u');

	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'DELETE FROM `test`.`users` u WHERE id = 1',
		data: []
	});

	test.end();
});

test('basic delete using deleteFrom', (test) => {
	var q = queryize().deleteFrom('users', 'u');

	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: []
	});

	test.end();
});
