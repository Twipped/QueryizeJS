
var test = require('tap').test;
var queryize = require('../');

test('update without set throws error', (test) => {
	var q = queryize().update().table('users', 'u');

	test.throws(function () {
		q.compile();
	});

	test.end();
});

test('update without where throws error', (test) => {
	var q = queryize().update().table('users', 'u');

	q.set('name', 'bob');

	test.throws(function () {
		q.compile();
	});

	test.end();
});

test('basic update', (test) => {
	var q = queryize().update().table('users', 'u');

	q.set('name', 'bob');
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = ? WHERE name = NULL',
		data: [ 'bob' ]
	});

	test.end();
});

test('basic update with database', (test) => {
	var q = queryize().update().database('test', 'users', 'u');

	q.set('name', 'bob');
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `test`.`users` u SET name = ? WHERE name = NULL',
		data: [ 'bob' ]
	});

	test.end();
});

test('basic update with object to set', (test) => {
	var q = queryize().update().table('users', 'u');

	q.set({ name: 'bob' });
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = ? WHERE name = NULL',
		data: [ 'bob' ]
	});

	test.end();
});

test('basic update with object to set + modifier', (test) => {
	var q = queryize().update().table('users', 'u');

	q.set({ name: 'bob' }, 'UPPER');
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = UPPER(?) WHERE name = NULL',
		data: [ 'bob' ]
	});

	test.end();
});

test('update with set value of object throws error', (test) => {
	var q = queryize().update().table('users', 'u');

	test.throws(function () {
		q.set({ name: { blah: 1 } });
	});

	test.end();
});

test('update with a date value', (test) => {
	var q = queryize().update().table('users', 'u');

	q.set({ lastlogin: new Date('2012-01-01') });
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = ? WHERE name = NULL',
		data: [ '2012-01-01 00:00:00' ]
	});

	test.end();
});

test('update with a number value', (test) => {
	var q = queryize().update().table('users', 'u');

	q.set({ lastlogin: 6 });
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = ? WHERE name = NULL',
		data: [ 6 ]
	});

	test.end();
});

test('update with a boolean value', (test) => {
	var q = queryize().update().table('users', 'u');

	q.set({ lastlogin: true });
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = TRUE WHERE name = NULL',
		data: []
	});

	test.end();
});

test('update with string where clause', (test) => {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = 1',
		data: []
	});

	test.end();
});

test('update with two argument where clause', (test) => {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where('id', 1);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = ?',
		data: [ 1 ]
	});

	test.end();
});

test('update with object where clause', (test) => {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where({ id: 1 });

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = ?',
		data: [ 1 ]
	});

	test.end();
});

test('update with a null value', (test) => {
	var q = queryize().update().database('test', 'users', 'u');

	q.set({
		firstname: 'bob',
		lastname: null
	});
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `test`.`users` u SET firstname = ?, lastname = NULL WHERE name = NULL',
		data: [ 'bob' ]
	});

	test.end();
});
