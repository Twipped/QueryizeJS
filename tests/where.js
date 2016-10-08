
var test = require('tap').test;
var queryize = require('../');

test('where without parameters erases the where clauses', (test) => {
	var q = queryize().select().from('users');

	q.where('id = 1');
	q.where();
	q.where('id = 20');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 20',
		data: []
	});

	test.end();
});

test('multiple where clauses with AND condition', (test) => {
	var q = queryize().select().from('users');

	q.where('id = 1');
	q.where('active', true);
	q.comparisonMethod(true);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1 AND active = TRUE',
		data: []
	});

	test.end();
});

test('multiple where clauses with OR condition', (test) => {
	var q = queryize().select().from('users');

	q.where('id = 1');
	q.where('active', true);
	q.comparisonMethod(false);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1 OR active = TRUE',
		data: []
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

test('select with string where clause in array', (test) => {
	var q = queryize().select().from('users');

	q.where([ 'id = 1' ]);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1',
		data: []
	});

	test.end();
});

test('select with string where clause in array, opening AND', (test) => {
	var q = queryize().select().from('users');

	q.where([ 'AND', 'id = 1' ]);

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
		data: [ 1 ]
	});

	test.end();
});

test('select with two argument where clause and operator', (test) => {
	var q = queryize().select().from('users');

	q.where('id', 1, '>');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id > ?',
		data: [ 1 ]
	});

	test.end();
});

test('select with two argument where clause containing value array', (test) => {
	var q = queryize().select().from('users');

	q.where('name', [ 'bob', 'jane' ]);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name IN (?,?)',
		data: [ 'bob', 'jane' ]
	});

	test.end();
});

test('select with two argument where clause containing value array and !=', (test) => {
	var q = queryize().select().from('users');

	q.where('name', [ 'bob', 'jane' ], '!=');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT IN (?,?)',
		data: [ 'bob', 'jane' ]
	});

	test.end();
});

test('select with two argument where clause containing value array and non-equality operator', (test) => {
	var q = queryize().select().from('users');

	q.where('name', [ 'bob', 'jane' ], 'LIKE');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (name LIKE ? OR name LIKE ?)',
		data: [ 'bob', 'jane' ]
	});

	test.end();
});

test('select with two argument where clause containing field array', (test) => {
	var q = queryize().select().from('users');

	q.where([ 'firstname', 'lastname' ], 'bob');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (firstname = ? OR lastname = ?)',
		data: [ 'bob', 'bob' ]
	});

	test.end();
});

test('select with object where clause', (test) => {
	var q = queryize().select().from('users');

	q.where({ id: 1 });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [ 1 ]
	});

	test.end();
});

test('select with object where clause in array', (test) => {
	var q = queryize().select().from('users');

	q.where([ { id: 1 } ]);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [ 1 ]
	});

	test.end();
});

test('select with 2 item object where clause', (test) => {
	var q = queryize().select().from('users');

	q.where({ id: 1, name: 'bob' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name = ?)',
		data: [ 1, 'bob' ]
	});

	test.end();
});

test('select with object where clause containing value array', (test) => {
	var q = queryize().select().from('users');

	q.where({ name: [ 'bob', 'jane' ] });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name IN (?,?)',
		data: [ 'bob', 'jane' ]
	});

	test.end();
});

test('select with 2 item object where clause with negation', (test) => {
	var q = queryize().select().from('users');

	q.where({ id: 1, not: true, name: 'bob' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name != ?)',
		data: [ 1, 'bob' ]
	});

	test.end();
});

test('select with object where clause with negation and a value array', (test) => {
	var q = queryize().select().from('users');

	q.where({ not: true, name: [ 'bob', 'jane' ] });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT IN (?,?)',
		data: [ 'bob', 'jane' ]
	});

	test.end();
});

test('select with double 2 item object where clause', (test) => {
	var q = queryize().select().from('users');

	q.where({ id: 1, name: 'bob' });
	q.where({ active: true, email: 'bob@bob.com' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name = ?) AND (active = TRUE AND email = ?)',
		data: [ 1, 'bob', 'bob@bob.com' ]
	});

	test.end();
});

test('select with object where clause and operator', (test) => {
	var q = queryize().select().from('users');

	q.where({ id: 1 }, '>');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id > ?',
		data: [ 1 ]
	});

	test.end();
});

test('select with whereNot', (test) => {
	var q = queryize().select().from('users');

	q.whereNot('id', 1);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id != ?',
		data: [ 1 ]
	});

	test.end();
});

test('select with whereNot using object', (test) => {
	var q = queryize().select().from('users');

	q.whereNot({ 'id': 1 });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id != ?',
		data: [ 1 ]
	});

	test.end();
});

test('select with whereLike', (test) => {
	var q = queryize().select().from('users');

	q.whereLike('name', 'bob%');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name LIKE ?',
		data: [ 'bob%' ]
	});

	test.end();
});

test('select with whereLike object', (test) => {
	var q = queryize().select().from('users');

	q.whereLike({ 'name': 'bob%' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name LIKE ?',
		data: [ 'bob%' ]
	});

	test.end();
});

test('select with whereNotLike', (test) => {
	var q = queryize().select().from('users');

	q.whereNotLike('name', 'bob%');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT LIKE ?',
		data: [ 'bob%' ]
	});

	test.end();
});

test('select with whereNotLike object', (test) => {
	var q = queryize().select().from('users');

	q.whereNotLike({ 'name': 'bob%' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT LIKE ?',
		data: [ 'bob%' ]
	});

	test.end();
});

test('select with whereBetween', (test) => {
	var q = queryize().select().from('users');

	q.whereBetween('id', 5, 10);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id BETWEEN ? AND ?',
		data: [ 5, 10 ]
	});

	test.end();
});

test('select with whereInRange', (test) => {
	var q = queryize().select().from('users');

	q.whereInRange('id', 5, 10);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id BETWEEN ? AND ?',
		data: [ 5, 10 ]
	});

	test.end();
});

test('select with whereInRange, without end', (test) => {
	var q = queryize().select().from('users');

	q.whereInRange('id', 5, null);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id >= ?',
		data: [ 5 ]
	});

	test.end();
});

test('select with whereInRange, without beginning', (test) => {
	var q = queryize().select().from('users');

	q.whereInRange('id', null, 10);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id <= ?',
		data: [ 10 ]
	});

	test.end();
});

test('select with whereInRange using dates', (test) => {
	var q = queryize().select().from('users');

	q.whereInRange('lastlogin', new Date('2013-01-01'), new Date('2014-01-01'));

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE lastlogin BETWEEN ? AND ?',
		data: [ '2013-01-01 00:00:00', '2014-01-01 00:00:00' ]
	});

	test.end();
});
