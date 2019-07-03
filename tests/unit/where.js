
var test = require('tap').test;
var queryize = require('../../');

test('where without parameters erases the where clauses', (t) => {
	var q = queryize().select().from('users');

	q.where('id = 1');
	q.where();
	q.where('id = 20');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 20',
		data: [],
	});

	t.end();
});

test('multiple where clauses with AND condition', (t) => {
	var q = queryize().select().from('users');

	q.where('id = 1');
	q.where('active', true);
	q.comparisonMethod(true);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1 AND active = TRUE',
		data: [],
	});

	t.end();
});

test('multiple where clauses with OR condition', (t) => {
	var q = queryize().select().from('users');

	q.where('id = 1');
	q.where('active', true);
	q.comparisonMethod(false);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1 OR active = TRUE',
		data: [],
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

test('select with string where clause in array', (t) => {
	var q = queryize().select().from('users');

	q.where([ 'id = 1' ]);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1',
		data: [],
	});

	t.end();
});

test('select with string where clause in array, opening AND', (t) => {
	var q = queryize().select().from('users');

	q.where([ 'AND', 'id = 1' ]);

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

test('select with two argument where clause and operator', (t) => {
	var q = queryize().select().from('users');

	q.where('id', 1, '>');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id > ?',
		data: [ 1 ],
	});

	t.end();
});

test('select with two argument where clause containing value array', (t) => {
	var q = queryize().select().from('users');

	q.where('name', [ 'bob', 'jane' ]);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name IN (?,?)',
		data: [ 'bob', 'jane' ],
	});

	t.end();
});

test('select with two argument where clause containing value array and !=', (t) => {
	var q = queryize().select().from('users');

	q.where('name', [ 'bob', 'jane' ], '!=');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT IN (?,?)',
		data: [ 'bob', 'jane' ],
	});

	t.end();
});

test('select with two argument where clause containing value array and non-equality operator', (t) => {
	var q = queryize().select().from('users');

	q.where('name', [ 'bob', 'jane' ], 'LIKE');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (name LIKE ? OR name LIKE ?)',
		data: [ 'bob', 'jane' ],
	});

	t.end();
});

test('select with two argument where clause containing field array', (t) => {
	var q = queryize().select().from('users');

	q.where([ 'firstname', 'lastname' ], 'bob');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (firstname = ? OR lastname = ?)',
		data: [ 'bob', 'bob' ],
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

test('select with object where clause in array', (t) => {
	var q = queryize().select().from('users');

	q.where([ { id: 1 } ]);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [ 1 ],
	});

	t.end();
});

test('select with 2 item object where clause', (t) => {
	var q = queryize().select().from('users');

	q.where({ id: 1, name: 'bob' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name = ?)',
		data: [ 1, 'bob' ],
	});

	t.end();
});

test('select with object where clause containing value array', (t) => {
	var q = queryize().select().from('users');

	q.where({ name: [ 'bob', 'jane' ] });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name IN (?,?)',
		data: [ 'bob', 'jane' ],
	});

	t.end();
});

test('select with 2 item object where clause with negation', (t) => {
	var q = queryize().select().from('users');

	q.where({ id: 1, not: true, name: 'bob' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name != ?)',
		data: [ 1, 'bob' ],
	});

	t.end();
});

test('select with object where clause with negation and a value array', (t) => {
	var q = queryize().select().from('users');

	q.where({ not: true, name: [ 'bob', 'jane' ] });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT IN (?,?)',
		data: [ 'bob', 'jane' ],
	});

	t.end();
});

test('select with double 2 item object where clause', (t) => {
	var q = queryize().select().from('users');

	q.where({ id: 1, name: 'bob' });
	q.where({ active: true, email: 'bob@bob.com' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name = ?) AND (active = TRUE AND email = ?)',
		data: [ 1, 'bob', 'bob@bob.com' ],
	});

	t.end();
});

test('select with object where clause and operator', (t) => {
	var q = queryize().select().from('users');

	q.where({ id: 1 }, '>');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id > ?',
		data: [ 1 ],
	});

	t.end();
});

test('select with whereNot', (t) => {
	var q = queryize().select().from('users');

	q.whereNot('id', 1);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id != ?',
		data: [ 1 ],
	});

	t.end();
});

test('select with whereNot using object', (t) => {
	var q = queryize().select().from('users');

	q.whereNot({ 'id': 1 });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id != ?',
		data: [ 1 ],
	});

	t.end();
});

test('select with whereLike', (t) => {
	var q = queryize().select().from('users');

	q.whereLike('name', 'bob%');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name LIKE ?',
		data: [ 'bob%' ],
	});

	t.end();
});

test('select with whereLike object', (t) => {
	var q = queryize().select().from('users');

	q.whereLike({ 'name': 'bob%' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name LIKE ?',
		data: [ 'bob%' ],
	});

	t.end();
});

test('select with whereNotLike', (t) => {
	var q = queryize().select().from('users');

	q.whereNotLike('name', 'bob%');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT LIKE ?',
		data: [ 'bob%' ],
	});

	t.end();
});

test('select with whereNotLike object', (t) => {
	var q = queryize().select().from('users');

	q.whereNotLike({ 'name': 'bob%' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT LIKE ?',
		data: [ 'bob%' ],
	});

	t.end();
});

test('select with whereBetween', (t) => {
	var q = queryize().select().from('users');

	q.whereBetween('id', 5, 10);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id BETWEEN ? AND ?',
		data: [ 5, 10 ],
	});

	t.end();
});

test('select with whereInRange', (t) => {
	var q = queryize().select().from('users');

	q.whereInRange('id', 5, 10);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id BETWEEN ? AND ?',
		data: [ 5, 10 ],
	});

	t.end();
});

test('select with whereInRange, without end', (t) => {
	var q = queryize().select().from('users');

	q.whereInRange('id', 5, null);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id >= ?',
		data: [ 5 ],
	});

	t.end();
});

test('select with whereInRange, without beginning', (t) => {
	var q = queryize().select().from('users');

	q.whereInRange('id', null, 10);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id <= ?',
		data: [ 10 ],
	});

	t.end();
});

test('select with whereInRange using dates', (t) => {
	var q = queryize().select().from('users');

	q.whereInRange('lastlogin', new Date('2013-01-01'), new Date('2014-01-01'));

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE lastlogin BETWEEN ? AND ?',
		data: [ '2013-01-01 00:00:00', '2014-01-01 00:00:00' ],
	});

	t.end();
});
