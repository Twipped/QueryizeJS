
var test = require('tap').test;
var queryize = require('../');

test('basic select', (test) => {
	var q = queryize().select().from('users', 'u');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u',
		data: []
	});

	test.end();
});

test('basic select with database', (test) => {
	var q = queryize().select().fromDatabase('test', 'users', 'u');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `test`.`users` u',
		data: []
	});

	test.end();
});

test('basic select with added columns', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn('columnB');

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, columnB FROM `users`',
		data: []
	});

	test.end();
});

test('basic select with added columns, with duplicates', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn('columnB');
	q.addColumn('columnB');

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, columnB, columnB FROM `users`',
		data: []
	});

	test.end();
});

test('basic select with added columns, without duplicates', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn('columnB', true);
	q.addColumn('columnB', true);

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, columnB FROM `users`',
		data: []
	});

	test.end();
});

test('basic select with multiple columns', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA', ['columnB', 'columnC']);

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, columnB, columnC FROM `users`',
		data: []
	});

	test.end();
});

test('basic select with value in columns', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA', 3, 'columnC');

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, ?, columnC FROM `users`',
		data: [3]
	});

	test.end();
});

test('basic select with added value column', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn(3);
	q.addColumn('columnC');

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, ?, columnC FROM `users`',
		data: [3]
	});

	test.end();
});

test('basic select with duplicate added value column, filtering duplicates', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn(3, true);
	q.addColumn(3, true);

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, ?, ? FROM `users`',
		data: [3, 3]
	});

	test.end();
});

test('basic select with value object in columns', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA', {data: 'foo'}, 'columnC');

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, ?, columnC FROM `users`',
		data: ['foo']
	});

	test.end();
});

test('basic select with modified date value object in columns', (test) => {
	var q = queryize().select().from('users');

	q.columns('columnA', {data: new Date('2014-01-01'), modifier: 'DATE'}, 'columnC');

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, DATE(?), columnC FROM `users`',
		data: ['2014-01-01 00:00:00']
	});

	test.end();
});

test('select with string where clause', (test) => {
	var q = queryize().select().from('users');

	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1',
		data: []
	});

	test.end();
});

test('select with two argument where clause', (test) => {
	var q = queryize().select().from('users');

	q.where('id', 1);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [1]
	});

	test.end();
});

test('select with object where clause', (test) => {
	var q = queryize().select().from('users');

	q.where({id: 1});

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [1]
	});

	test.end();
});

test('select with orderBy', (test) => {
	var q = queryize().select().from('users');

	q.orderBy('name');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` ORDER BY name',
		data: []
	});

	test.end();
});

test('select with groupBy', (test) => {
	var q = queryize().select().from('users');

	q.groupBy('name');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` GROUP BY name',
		data: []
	});

	test.end();
});

test('select with limit', (test) => {
	var q = queryize().select().from('users');

	q.limit(10);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` LIMIT 10',
		data: []
	});

	test.end();
});

test('select with limit and offset', (test) => {
	var q = queryize().select().from('users');

	q.limit(10, 20);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` LIMIT 20, 10',
		data: []
	});

	test.end();
});

test('select with empty limit', (test) => {
	var q = queryize().select().from('users');

	q.limit(10);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` LIMIT 10',
		data: []
	});

	q.limit();

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users`',
		data: []
	});

	test.end();
});

test('select with distinct', (test) => {
	var q = queryize().select().from('users');

	q.distinct();

	test.deepEqual(q.compile(), {
		query: 'SELECT DISTINCT * FROM `users`',
		data: []
	});

	test.end();
});
