
var test = require('tap').test;
var queryize = require('../../');

test('select with empty join throws error', (t) => {
	var q = queryize().select().from('users', 'u');

	t.throws(() => {
		q.join();
	});

	t.end();
});

test('select with string join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('JOIN passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string join and custom binding', (t) => {
	var q = queryize().select().from('users', 'u');

	q.insertBinding('orderType', 'express');
	q.join('JOIN orders o ON o.userid = u.id AND o.type = {{orderType}}');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN orders o ON o.userid = u.id AND o.type = ?',
		data: [ 'express' ],
	});

	t.end();
});

test('select with string join, no join prefix', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string inner join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('JOIN passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string inner join, no prefix', (t) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string inner join, full prefix', (t) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('INNER JOIN passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string left join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin('JOIN passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string left join, no prefix', (t) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin('passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string left join, full prefix', (t) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin('LEFT JOIN passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string right join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin('JOIN passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string right join, no prefix', (t) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin('passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with string right join, full prefix', (t) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin('RIGHT JOIN passwords p ON p.userid = u.id');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p ON p.userid = u.id',
		data: [],
	});

	t.end();
});

test('select with object join, missing table, throws error', (t) => {
	var q = queryize().select().from('users', 'u');

	t.throws(() => {
		q.join({});
	});

	t.end();
});

test('select with object join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join({ table: 'passwords', alias: 'p' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p',
		data: [],
	});

	t.end();
});

test('select with object left join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin({ table: 'passwords', alias: 'p' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p',
		data: [],
	});

	t.end();
});

test('select with object right join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin({ table: 'passwords', alias: 'p' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p',
		data: [],
	});

	t.end();
});

test('select with object inner join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin({ table: 'passwords', alias: 'p' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p',
		data: [],
	});

	t.end();
});

test('select with name+options join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p',
		data: [],
	});

	t.end();
});

test('select with name+options inner join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('passwords', { alias: 'p' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN passwords p',
		data: [],
	});

	t.end();
});

test('select with name+options left join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin('passwords', { alias: 'p' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN passwords p',
		data: [],
	});

	t.end();
});

test('select with name+options right join', (t) => {
	var q = queryize().select().from('users', 'u');

	q.rightJoin('passwords', { alias: 'p' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u RIGHT JOIN passwords p',
		data: [],
	});

	t.end();
});

test('select with name+options join using', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', using: 'id' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p USING (id)',
		data: [],
	});

	t.end();
});

test('select with name+options join using array', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', using: [ 'id', 'valid' ] });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p USING (id, valid)',
		data: [],
	});

	t.end();
});

test('select with name+options join on string', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: 'p.userid = id' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = id)',
		data: [],
	});

	t.end();
});

test('select with name+options join on array of strings', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: [ 'p.userid = u.id', 'p.hash IS NOT NULL' ] });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.hash IS NOT NULL)',
		data: [],
	});

	t.end();
});

test('select with name+options join on object', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.hash': 'NULL' } });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.hash = NULL)',
		data: [],
	});

	t.end();
});

test('select with name+options join on object with negation', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', not: true, 'p.hash': "''" } });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.hash != \'\')',
		data: [],
	});

	t.end();
});

test('select with name+options join on mixed array', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: [ { 'p.userid': 'u.id' }, 'p.hash IS NOT NULL' ] });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.hash IS NOT NULL)',
		data: [],
	});

	t.end();
});

test('select with name+options join on object with date', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': new Date('2013-01-01') } });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset = ?)',
		data: [ '2013-01-01 00:00:00' ],
	});

	t.end();
});

test('select with name+options join on object with null', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': null } });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset = NULL)',
		data: [ ],
	});

	t.end();
});

test('select with name+options join on object with data object', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': { data: 2 } } });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset = ?)',
		data: [ 2 ],
	});

	t.end();
});

test('select with name+options join on object with data object containing null', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': { data: null } } });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset = NULL)',
		data: [],
	});

	t.end();
});

test('select with name+options join on object with array', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id', 'p.dateset': [ 1, 2 ] } });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN passwords p ON (p.userid = u.id AND p.dateset IN ( ?, ? ))',
		data: [ 1, 2 ],
	});

	t.end();
});

test('delete with name+options join on object', (t) => {
	var q = queryize().deleteFrom([ 'users', 'p' ], 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id' } });
	q.where('u.id', 2);

	t.deepEqual(q.compile(), {
		query: 'DELETE u, p FROM `users` u JOIN passwords p ON (p.userid = u.id) WHERE u.id = ?',
		data: [ 2 ],
	});

	t.end();
});

test('update with name+options join on object', (t) => {
	var q = queryize().update('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id' } });
	q.set({ 'u.active': true, 'p.hash': 'fakehashdata' });
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` u JOIN passwords p ON (p.userid = u.id) SET u.active = TRUE, p.hash = ? WHERE name = NULL',
		data: [ 'fakehashdata' ],
	});

	t.end();
});

test('insert with name+options join on object does not display join', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.join('passwords', { alias: 'p', on: { 'p.userid': 'u.id' } });
	q.set({ 'u.active': true, 'p.hash': 'fakehashdata' });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET u.active = TRUE, p.hash = ?',
		data: [ 'fakehashdata' ],
	});

	t.end();
});

test('select with multiple joins', (t) => {
	var q = queryize().select('COUNT(c.id)').from('users', 'u');

	q.join('posts', { alias: 'p', on: { 'p.userid': 'u.id' } });
	q.leftJoin('comments', { alias: 'c', on: { 'c.postid': 'p.id' } });

	t.deepEqual(q.compile(), {
		query: 'SELECT COUNT(c.id) FROM `users` u JOIN posts p ON (p.userid = u.id) LEFT JOIN comments c ON (c.postid = p.id)',
		data: [],
	});

	t.end();
});

test('update with join', (t) => {
	var q = queryize().update('tablea');

	q.join('tableb', { on: { 'tablea.id': 'tableb.id' } });
	q.set('tablea.foo = tableb.foo');
	q.where('tablea.batch', 10);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `tablea` JOIN tableb ON (tablea.id = tableb.id) SET tablea.foo = tableb.foo WHERE tablea.batch = ?',
		data: [ 10 ],
	});

	t.end();
});
