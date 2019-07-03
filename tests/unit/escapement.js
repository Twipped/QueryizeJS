
var test = require('tap').test;
var queryize = require('../../');

test('basic select with value in columns', (t) => {
	var q = queryize().disableBoundParameters().select().from('users');

	q.columns('columnA', 3, 'columnC');

	t.deepEqual(q.compile(), {
		query: 'SELECT columnA, 3, columnC FROM `users`',
		data: [],
	});

	t.done();
});

test('select with 2 item object where clause', (t) => {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({ id: 1, name: 'bob' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = 1 AND name = \'bob\')',
		data: [],
	});

	t.end();
});

test('select with injection attempt', (t) => {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({ name: 'x\' AND email IS NULL; --' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name = \'x\\\' AND email IS NULL; --\'',
		data: [],
	});

	t.end();
});

test('select with injection attempt, part 2', (t) => {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({ name: 'x" AND email IS NULL; --' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name = \'x\\" AND email IS NULL; --\'',
		data: [],
	});

	t.end();
});

test('select with object, throws error', (t) => {
	var q = queryize().disableBoundParameters().select().from('users');

	t.throws(() => {
		q.where({ name: {} });
	});

	t.end();
});
