
var test = require('tap').test;
var queryize = require('../../');

test('select with empty join throws error', (test) => {
	var q = queryize().select().from('users', 'u');

	test.throws(function () {
		q.join();
	});

	test.end();
});

test('select with string join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('JOIN passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string join and custom binding', (test) => {
	var q = queryize().select().from('users', 'u');

	q.insertBinding('orderType', 'express');
	q.join('JOIN orders o ON o.userid = u.id AND o.type = {{orderType}}');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN orders o ON o.userid = u.id AND o.type = ?',
		data: [ 'express' ]
	});

	test.end();
});

test('select with string join, no join prefix', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string inner join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('JOIN passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string inner join, no prefix', (test) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string inner join, full prefix', (test) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('INNER JOIN passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string left join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin('JOIN passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string left join, no prefix', (test) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin('passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string left join, full prefix', (test) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin('LEFT JOIN passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string right join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin('JOIN passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string right join, no prefix', (test) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin('passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with string right join, full prefix', (test) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin('RIGHT JOIN passwords p ON p.userid = u.id');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p ON p.userid = u.id',
		data: []
	});

	test.end();
});

test('select with object join, missing table, throws error', (test) => {
	var q = queryize().select().from('users', 'u');

	test.throws(function () {
		q.join({});
	});

	test.end();
});

test('select with object join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join({ table: 'passwords', alias: 'p' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p',
		data: []
	});

	test.end();
});

test('select with object left join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin({ table: 'passwords', alias: 'p' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p',
		data: []
	});

	test.end();
});

test('select with object right join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin({ table: 'passwords', alias: 'p' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p',
		data: []
	});

	test.end();
});

test('select with object inner join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin({ table: 'passwords', alias: 'p' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p',
		data: []
	});

	test.end();
});

test('select with name+options join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p',
		data: []
	});

	test.end();
});

test('select with name+options inner join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('passwords', { alias: 'p' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p',
		data: []
	});

	test.end();
});

test('select with name+options left join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin('passwords', { alias: 'p' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p',
		data: []
	});

	test.end();
});

test('select with name+options right join', (test) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin('passwords', { alias: 'p' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p',
		data: []
	});

	test.end();
});

test('select with name+options join using', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', using: 'id' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p USING (id)',
		data: []
	});

	test.end();
});

test('select with name+options join using array', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', using: [ 'id', 'valid' ] });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p USING (id, valid)',
		data: []
	});

	test.end();
});

test('select with name+options join on string', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: 'p.userid = id' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = id)',
		data: []
	});

	test.end();
});

test('select with name+options join on array of strings', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: [ 'p.userid = u.id', 'p.hash IS NOT NULL' ] });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.hash IS NOT NULL)',
		data: []
	});

	test.end();
});

test('select with name+options join on object', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.hash': 'NULL' } });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.hash = NULL)',
		data: []
	});

	test.end();
});

test('select with name+options join on object with negation', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', not: true, 'p.hash': "''" } });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.hash != \'\')',
		data: []
	});

	test.end();
});

test('select with name+options join on mixed array', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: [ { 'p.userid': 'u.id' }, 'p.hash IS NOT NULL' ] });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.hash IS NOT NULL)',
		data: []
	});

	test.end();
});

test('select with name+options join on object with date', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': new Date('2013-01-01') } });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset = ?)',
		data: [ '2013-01-01 00:00:00' ]
	});

	test.end();
});

test('select with name+options join on object with null', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': null } });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset = NULL)',
		data: [ ]
	});

	test.end();
});

test('select with name+options join on object with data object', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': { data: 2 } } });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset = ?)',
		data: [ 2 ]
	});

	test.end();
});

test('select with name+options join on object with data object containing null', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': { data: null } } });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset = NULL)',
		data: []
	});

	test.end();
});

test('select with name+options join on object with array', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': [ 1, 2 ] } });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset IN ( ?, ? ))',
		data: [ 1, 2 ]
	});

	test.end();
});

test('delete with name+options join on object', (test) => {
	var q = queryize().deleteFrom([ 'users', 'p' ], 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id' } });
	q.where('u.id', 2);

	test.deepEqual(q.compile(), {
		query: 'DELETE u, p FROM `users` u JOIN passwords p ON (p.userid = u.id) WHERE u.id = ?',
		data: [ 2 ]
	});

	test.end();
});

test('update with name+options join on object', (test) => {
	var q = queryize().update('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id' } });
	q.set({ 'u.active': true, 'p.hash': 'fakehashdata' });
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u JOIN passwords p ON (p.userid = u.id) SET u.active = TRUE, p.hash = ? WHERE name = NULL',
		data: [ 'fakehashdata' ]
	});

	test.end();
});

test('insert with name+options join on object does not display join', (test) => {
	var q = queryize().insert().into('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id' } });
	q.set({ 'u.active': true, 'p.hash': 'fakehashdata' });

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET u.active = TRUE, p.hash = ?',
		data: [ 'fakehashdata' ]
	});

	test.end();
});

test('select with multiple joins', (test) => {
	var q = queryize().select('COUNT(c.id)').from('users', 'u');

	q.join('posts', { alias: 'p', on: { 'p.userid': 'u.id' } });
	q.leftJoin('comments', { alias: 'c', on: { 'c.postid': 'p.id' } });

	test.deepEqual(q.compile(), {
		query: 'SELECT COUNT(c.id) FROM `users` u JOIN posts p ON (p.userid = u.id) LEFT JOIN comments c ON (c.postid = p.id)',
		data: []
	});

	test.end();
});

test('update with join', (test) => {
	var q = queryize().update('tablea');

	q.join('tableb', { on: { 'tablea.id': 'tableb.id' } });
	q.set('tablea.foo = tableb.foo');
	q.where('tablea.batch', 10);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `tablea` JOIN tableb ON (tablea.id = tableb.id) SET tablea.foo = tableb.foo WHERE tablea.batch = ?',
		data: [ 10 ]
	});

	test.end();
});
