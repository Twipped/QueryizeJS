
var test = require('tap').test;
var queryize = require('../../');

test('basic select', (t) => {
	var q = queryize().select().from('users', 'u');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u',
		data: [],
	});

	t.end();
});

test('basic select with database', (t) => {
	var q = queryize().select().fromDatabase('test', 'users', 'u');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `test`.`users` u',
		data: [],
	});

	t.end();
});

test('basic select with added columns', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn('columnB');

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, columnB FROM `users`',
		data: [],
	});

	t.end();
});

test('basic select with added columns, with duplicates', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn('columnB');
	q.addColumn('columnB');

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, columnB, columnB FROM `users`',
		data: [],
	});

	t.end();
});

test('basic select with added columns, without duplicates', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn('columnB', true);
	q.addColumn('columnB', true);

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, columnB FROM `users`',
		data: [],
	});

	t.end();
});

test('basic select with multiple columns', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA', [ 'columnB', 'columnC' ]);

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, columnB, columnC FROM `users`',
		data: [],
	});

	t.end();
});

test('basic select with value in columns', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA', 3, 'columnC');

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, ?, columnC FROM `users`',
		data: [ 3 ],
	});

	t.end();
});

test('basic select with added value column', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn(3);
	q.addColumn('columnC');

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, ?, columnC FROM `users`',
		data: [ 3 ],
	});

	t.end();
});

test('basic select with duplicate added value column, filtering duplicates', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA');
	q.addColumn(3, true);
	q.addColumn(3, true);

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, ?, ? FROM `users`',
		data: [ 3, 3 ],
	});

	t.end();
});

test('basic select with value object in columns', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA', { data: 'foo' }, 'columnC');

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, ?, columnC FROM `users`',
		data: [ 'foo' ],
	});

	t.end();
});

test('basic select with modified date value object in columns', (t) => {
	var q = queryize().select().from('users');

	q.columns('columnA', { data: new Date('2014-01-01'), modifier: 'DATE' }, 'columnC');

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, DATE(?), columnC FROM `users`',
		data: [ '2014-01-01 00:00:00' ],
	});

	t.end();
});

test('select with string where clause', (t) => {
	var q = queryize().select().from('users');

	q.where('id = 1');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1',
		data: [],
	});

	t.end();
});

test('select with two argument where clause', (t) => {
	var q = queryize().select().from('users');

	q.where('id', 1);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [ 1 ],
	});

	t.end();
});

test('select with object where clause', (t) => {
	var q = queryize().select().from('users');

	q.where({ id: 1 });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [ 1 ],
	});

	t.end();
});

test('select with orderBy', (t) => {
	var q = queryize().select().from('users');

	q.orderBy('name');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` ORDER BY name',
		data: [],
	});

	t.end();
});

test('select with groupBy', (t) => {
	var q = queryize().select().from('users');

	q.groupBy('name');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` GROUP BY name',
		data: [],
	});

	t.end();
});

test('select with limit', (t) => {
	var q = queryize().select().from('users');

	q.limit(10);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` LIMIT 10',
		data: [],
	});

	t.end();
});

test('select with limit and offset', (t) => {
	var q = queryize().select().from('users');

	q.limit(10, 20);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` LIMIT 20, 10',
		data: [],
	});

	t.end();
});

test('select with empty limit', (t) => {
	var q = queryize().select().from('users');

	q.limit(10);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` LIMIT 10',
		data: [],
	});

	q.limit();

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users`',
		data: [],
	});

	t.end();
});

test('select with distinct', (t) => {
	var q = queryize().select().from('users');

	q.distinct();

	t.deepEqual(q.compile(), {
		query: 'SELECT DISTINCT * FROM `users`',
		data: [],
	});

	t.end();
});
