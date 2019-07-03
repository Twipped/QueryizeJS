
var test = require('tap').test;
var queryize = require('../../');

test('update without set throws error', (t) => {
	var q = queryize().update().table('users', 'u');

	t.throws(() => {
		q.compile();
	});

	t.end();
});

test('update without where throws error', (t) => {
	var q = queryize().update().table('users', 'u');

	q.set('name', 'bob');

	t.throws(() => {
		q.compile();
	});

	t.end();
});

test('basic update', (t) => {
	var q = queryize().update().table('users', 'u');

	q.set('name', 'bob');
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = ? WHERE name = NULL',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic update with database', (t) => {
	var q = queryize().update().database('test', 'users', 'u');

	q.set('name', 'bob');
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `test`.`users` u SET name = ? WHERE name = NULL',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic update with object to set', (t) => {
	var q = queryize().update().table('users', 'u');

	q.set({ name: 'bob' });
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = ? WHERE name = NULL',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic update with object to set + modifier', (t) => {
	var q = queryize().update().table('users', 'u');

	q.set({ name: 'bob' }, 'UPPER');
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = UPPER(?) WHERE name = NULL',
		data: [ 'bob' ],
	});

	t.end();
});

test('update with set value of object throws error', (t) => {
	var q = queryize().update().table('users', 'u');

	t.throws(() => {
		q.set({ name: { blah: 1 } });
	});

	t.end();
});

test('update with a date value', (t) => {
	var q = queryize().update().table('users', 'u');

	q.set({ lastlogin: new Date('2012-01-01') });
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = ? WHERE name = NULL',
		data: [ '2012-01-01 00:00:00' ],
	});

	t.end();
});

test('update with a number value', (t) => {
	var q = queryize().update().table('users', 'u');

	q.set({ lastlogin: 6 });
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = ? WHERE name = NULL',
		data: [ 6 ],
	});

	t.end();
});

test('update with a boolean value', (t) => {
	var q = queryize().update().table('users', 'u');

	q.set({ lastlogin: true });
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = TRUE WHERE name = NULL',
		data: [],
	});

	t.end();
});

test('update with string where clause', (t) => {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where('id = 1');

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = 1',
		data: [],
	});

	t.end();
});

test('update with two argument where clause', (t) => {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where('id', 1);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = ?',
		data: [ 1 ],
	});

	t.end();
});

test('update with object where clause', (t) => {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where({ id: 1 });

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = ?',
		data: [ 1 ],
	});

	t.end();
});

test('update with a null value', (t) => {
	var q = queryize().update().database('test', 'users', 'u');

	q.set({
		firstname: 'bob',
		lastname: null,
	});
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `test`.`users` u SET firstname = ?, lastname = NULL WHERE name = NULL',
		data: [ 'bob' ],
	});

	t.end();
});
