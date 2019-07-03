
var test = require('tap').test;
var queryize = require('../../');

test('delete without where throws error', (t) => {
	var q = queryize().delete().from('users', 'u');

	t.throws(() => {
		q.compile();
	});

	t.end();
});

test('basic delete', (t) => {
	var q = queryize().delete().from('users', 'u');

	q.where('id = 1');

	t.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: [],
	});

	t.end();
});

test('basic delete with database', (t) => {
	var q = queryize().delete().fromDatabase('t', 'users', 'u');

	q.where('id = 1');

	t.deepEqual(q.compile(), {
		query: 'DELETE FROM `t`.`users` u WHERE id = 1',
		data: [],
	});

	t.end();
});

test('basic delete using deleteFrom', (t) => {
	var q = queryize().deleteFrom('users', 'u');

	q.where('id = 1');

	t.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: [],
	});

	t.end();
});
