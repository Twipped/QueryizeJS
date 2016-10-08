
var test = require('tap').test;
var queryize = require('../');

test('insert without set throws error', (test) => {
	var q = queryize().insert().into('users', 'u');

	test.throws(function () {
		q.compile();
	});

	test.end();
});

test('basic insert', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.set('name', 'bob');

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET name = ?',
		data: ['bob']
	});

	test.end();
});

test('basic insert with database', (test) => {
	var q = queryize().insert().intoDatabase('test', 'users', 'u');

	q.set('name', 'bob');

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `test`.`users` u SET name = ?',
		data: ['bob']
	});

	test.end();
});

test('basic insert with object to set', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.set({name: 'bob'});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET name = ?',
		data: ['bob']
	});

	test.end();
});

test('basic insert with multiple-keyed object to set', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.set({
		firstname: 'Bojack',
		lastname: 'Horseman'
	});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET firstname = ?, lastname = ?',
		data: ['Bojack', 'Horseman']
	});

	test.end();
});

test('insert with set value of object throws error', (test) => {
	var q = queryize().insert().into('users', 'u');

	test.throws(function () {
		q.set({name: {blah: 1}});
	});

	test.end();
});

test('insert with a date value', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.set({lastlogin: new Date('2012-01-01')});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: ['2012-01-01 00:00:00']
	});

	test.end();
});

test('insert with a number value', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.set({lastlogin: 6});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: [6]
	});

	test.end();
});

test('insert with a boolean value', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.set({lastlogin: true});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = TRUE',
		data: []
	});

	test.end();
});

test('set throws an error if no parameters provided', (test) => {
	var q = queryize().insert().into('users', 'u');

	test.throws(function () {
		q.set();
	});

	test.end();
});

test('set overwrites', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.set({lastlogin: 6});
	q.set({lastlogin: 7});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: [7]
	});

	test.end();
});

test('set raw value', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.set({lastlogin: {raw: 'NOW()'}});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = NOW()',
		data: []
	});

	test.end();
});

test('insert called with arguments', (test) => {
	var q = queryize().insert({value: false}).into('users', 'u');

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET value = FALSE',
		data: []
	});

	test.end();
});

test('replace into', (test) => {
	var q = queryize().replace({value: false}).into('users', 'u');

	test.deepEqual(q.compile(), {
		query: 'REPLACE INTO `users` u SET value = FALSE',
		data: []
	});

	test.end();
});

test('multi-insert', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.addRow({lastlogin: 6});
	q.addRow({lastlogin: 10});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u ( lastlogin ) VALUES (?), (?)',
		data: [6, 10]
	});

	test.deepEqual(q._attributes.columns, ['lastlogin']);

	test.end();
});

test('multi-insert replace', (test) => {
	var q = queryize().replace().into('users', 'u');

	q.addRow({lastlogin: 6});
	q.addRow({lastlogin: 10});

	test.deepEqual(q.compile(), {
		query: 'REPLACE INTO `users` u ( lastlogin ) VALUES (?), (?)',
		data: [6, 10]
	});

	test.deepEqual(q._attributes.columns, ['lastlogin']);

	test.end();
});

test('multi-insert, multi-column', (test) => {
	var q = queryize().insert().into('users');

	q.addRow({name: 'John Doe', age: 26});
	q.addRow({name: 'Bob Smith', age: 32});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` ( name, age ) VALUES (?, ?), (?, ?)',
		data: ['John Doe', 26, 'Bob Smith', 32]
	});

	test.deepEqual(q._attributes.columns, ['name', 'age']);

	test.end();
});

test('multi-insert w/ raw value', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.addRow({lastlogin: {raw: 'NOW()'}});
	q.addRow({lastlogin: 10});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u ( lastlogin ) VALUES (NOW()), (?)',
		data: [10]
	});

	test.deepEqual(q._attributes.columns, ['lastlogin']);

	test.end();
});

test('multi-insert, adding arrays', (test) => {
	var q = queryize().insert().into('users');

	q.columns('name', 'age');
	q.addRow(['John Doe', 26]);
	q.addRow(['Bob Smith', 32]);

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` ( name, age ) VALUES (?, ?), (?, ?)',
		data: ['John Doe', 26, 'Bob Smith', 32]
	});

	test.deepEqual(q._attributes.columns, ['name', 'age']);

	test.end();
});

test('multi-insert, adding arrays w/o columns throws', (test) => {
	var q = queryize().insert().into('users');

	test.throws(function () {
		q.addRow(['John Doe', 26]);
	});

	test.end();
});
