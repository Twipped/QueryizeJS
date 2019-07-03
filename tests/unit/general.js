
var test = require('tap').test;
var queryize = require('../../');

test('exports correctly', (t) => {
	t.strictEqual(typeof queryize, 'function', 'queryize is a function');
	t.end();
});

test('compile without method throws error', (t) => {
	var q = queryize();

	t.throws(() => {
		q.compile();
	});

	t.end();
});

test('compile without table throws error', (t) => {
	var q = queryize().select();

	t.throws(() => {
		q.compile();
	});

	t.end();
});

test('basic select, copied', (t) => {
	var a = queryize().select().from('users', 'u');

	var b = queryize(a);

	t.deepEqual(b.compile(), {
		query: 'SELECT * FROM `users` u',
		data: [],
	});

	t.end();
});

test('basic select from shortcut', (t) => {
	var q = queryize.select().from('users', 'u');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u',
		data: [],
	});

	t.end();
});

test('basic update from shortcut', (t) => {
	var q = queryize.update().table('users', 'u');

	q.set('name', 'bob');
	q.where('name', null);

	t.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = ? WHERE name = NULL',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic insert from shortcut', (t) => {
	var q = queryize.insert().into('users', 'u');

	q.set('name', 'bob');

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET name = ?',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic replace from shortcut', (t) => {
	var q = queryize.replace().into('users', 'u');

	q.set('name', 'bob');

	t.deepEqual(q.compile(), {
		query: 'REPLACE INTO `users` u SET name = ?',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic delete from shortcut', (t) => {
	var q = queryize.delete().from('users', 'u');

	q.where('id = 1');

	t.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: [],
	});

	t.end();
});

test('basic deleteFrom from shortcut', (t) => {
	var q = queryize.deleteFrom('users', 'u');

	q.where('id = 1');

	t.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: [],
	});

	t.end();
});

test('query duplication', (t) => {
	t.plan(3);
	var a = queryize.deleteFrom('users', 'u');
	var b = queryize(a);
	var c = b.clone();

	a.where('id = 1');
	c.where('id = 2');

	t.deepEqual(a.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: [],
	});

	t.throws(() => {
		b.compile();
	});

	t.deepEqual(c.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 2',
		data: [],
	});

	t.end();
});

test('pre-seeded query', (t) => {
	t.plan(1);

	var q = queryize({
		tableName: 'users',
		alias: 'u',
		builder: 'select',
	});

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u',
		data: [],
	});

	t.end();
});

test('confirm pre-bound mutators', (t) => {
	var q = queryize();
	var from = q.from;
	var select = q.select;
	var where = q.where;

	select();
	from('users');
	where('id = 12');
	where('name IS NOT NULL');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 12 AND name IS NOT NULL',
		data: [],
	});

	t.end();
});

test('debug toggles the correct flag', (t) => {
	t.plan(3);
	var q = queryize();

	t.strictEqual(q._attributes.debugEnabled, false);

	q.debug();

	t.strictEqual(q._attributes.debugEnabled, true);

	q.debug(false);

	t.strictEqual(q._attributes.debugEnabled, false);

	t.end();
});

test('casting to a string produces a query', (t) => {
	var q = queryize.select()
		.from('users')
		.where({ id: 63, type: 'h\'fan' });

	t.strictEqual('' + q, 'SELECT * FROM `users` WHERE (id = 63 AND type = \'h\\\'fan\')');

	t.end();
});
