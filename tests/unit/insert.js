
var test = require('tap').test;
var queryize = require('../../');

test('insert without set throws error', (t) => {
	var q = queryize().insert().into('users', 'u');

	t.throws(() => {
		q.compile();
	});

	t.end();
});

test('basic insert', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.set('name', 'bob');

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET name = ?',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic insert with database', (t) => {
	var q = queryize().insert().intoDatabase('test', 'users', 'u');

	q.set('name', 'bob');

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `test`.`users` u SET name = ?',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic insert with object to set', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.set({ name: 'bob' });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET name = ?',
		data: [ 'bob' ],
	});

	t.end();
});

test('basic insert with multiple-keyed object to set', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.set({
		firstname: 'Bojack',
		lastname: 'Horseman',
	});

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET firstname = ?, lastname = ?',
		data: [ 'Bojack', 'Horseman' ],
	});

	t.end();
});

test('insert with set value of object throws error', (t) => {
	var q = queryize().insert().into('users', 'u');

	t.throws(() => {
		q.set({ name: { blah: 1 } });
	});

	t.end();
});

test('insert with a date value', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.set({ lastlogin: new Date('2012-01-01') });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: [ '2012-01-01 00:00:00' ],
	});

	t.end();
});

test('insert with a number value', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.set({ lastlogin: 6 });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: [ 6 ],
	});

	t.end();
});

test('insert with a boolean value', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.set({ lastlogin: true });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = TRUE',
		data: [],
	});

	t.end();
});

test('set throws an error if no parameters provided', (t) => {
	var q = queryize().insert().into('users', 'u');

	t.throws(() => {
		q.set();
	});

	t.end();
});

test('set overwrites', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.set({ lastlogin: 6 });
	q.set({ lastlogin: 7 });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: [ 7 ],
	});

	t.end();
});

test('set raw value', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.set({ lastlogin: { raw: 'NOW()' } });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = NOW()',
		data: [],
	});

	t.end();
});

test('insert called with arguments', (t) => {
	var q = queryize().insert({ value: false }).into('users', 'u');

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET value = FALSE',
		data: [],
	});

	t.end();
});

test('replace into', (t) => {
	var q = queryize().replace({ value: false }).into('users', 'u');

	t.deepEqual(q.compile(), {
		query: 'REPLACE INTO `users` u SET value = FALSE',
		data: [],
	});

	t.end();
});

test('insert with ignore', (t) => {
	var q = queryize().insertIgnore({ value: false }).into('users', 'u');

	t.deepEqual(q.compile(), {
		query: 'INSERT IGNORE INTO `users` u SET value = FALSE',
		data: [],
	});

	t.end();
});

test('multi-insert', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.addRow({ lastlogin: 6 });
	q.addRow({ lastlogin: 10 });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u ( lastlogin ) VALUES (?), (?)',
		data: [ 6, 10 ],
	});

	t.deepEqual(q._attributes.columns, [ 'lastlogin' ]);

	t.end();
});

test('multi-insert replace', (t) => {
	var q = queryize().replace().into('users', 'u');

	q.addRow({ lastlogin: 6 });
	q.addRow({ lastlogin: 10 });

	t.deepEqual(q.compile(), {
		query: 'REPLACE INTO `users` u ( lastlogin ) VALUES (?), (?)',
		data: [ 6, 10 ],
	});

	t.deepEqual(q._attributes.columns, [ 'lastlogin' ]);

	t.end();
});

test('multi-insert, multi-column', (t) => {
	var q = queryize().insert().into('users');

	q.addRow({ name: 'John Doe', age: 26 });
	q.addRow({ name: 'Bob Smith', age: 32 });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` ( name, age ) VALUES (?, ?), (?, ?)',
		data: [ 'John Doe', 26, 'Bob Smith', 32 ],
	});

	t.deepEqual(q._attributes.columns, [ 'name', 'age' ]);

	t.end();
});

test('multi-insert w/ raw value', (t) => {
	var q = queryize().insert().into('users', 'u');

	q.addRow({ lastlogin: { raw: 'NOW()' } });
	q.addRow({ lastlogin: 10 });

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u ( lastlogin ) VALUES (NOW()), (?)',
		data: [ 10 ],
	});

	t.deepEqual(q._attributes.columns, [ 'lastlogin' ]);

	t.end();
});

test('multi-insert, adding arrays', (t) => {
	var q = queryize().insert().into('users');

	q.columns('name', 'age');
	q.addRow([ 'John Doe', 26 ]);
	q.addRow([ 'Bob Smith', 32 ]);

	t.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` ( name, age ) VALUES (?, ?), (?, ?)',
		data: [ 'John Doe', 26, 'Bob Smith', 32 ],
	});

	t.deepEqual(q._attributes.columns, [ 'name', 'age' ]);

	t.end();
});

test('multi-insert, adding arrays w/o columns throws', (t) => {
	var q = queryize().insert().into('users');

	t.throws(() => {
		q.addRow([ 'John Doe', 26 ]);
	});

	t.end();
});
