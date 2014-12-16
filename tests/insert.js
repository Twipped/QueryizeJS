
var queryize = require('../queryize');

exports['insert without set throws error'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	test.throws(function () {
		q.compile();
	});

	test.done();
};

exports['basic insert'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.set('name', 'bob');

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET name = ?',
		data: ['bob']
	});

	test.done();
};

exports['basic insert with database'] = function (test) {
	var q = queryize().insert().intoDatabase('test', 'users', 'u');
		
	q.set('name', 'bob');

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `test`.`users` u SET name = ?',
		data: ['bob']
	});

	test.done();
};

exports['basic insert with object to set'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.set({name: 'bob'});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET name = ?',
		data: ['bob']
	});

	test.done();
};

exports['basic insert with multiple-keyed object to set'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.set({
		firstname: 'Bojack',
		lastname: 'Horseman'
	});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET firstname = ?, lastname = ?',
		data: ['Bojack', 'Horseman']
	});

	test.done();
};

exports['insert with set value of object throws error'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	test.throws(function () {
		q.set({name: {blah: 1}});
	});

	test.done();
};

exports['insert with a date value'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.set({lastlogin: new Date('2012-01-01')});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: ['2012-01-01 00:00:00']
	});

	test.done();
};

exports['insert with a number value'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.set({lastlogin: 6});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: [6]
	});

	test.done();
};

exports['insert with a boolean value'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.set({lastlogin: true});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = TRUE',
		data: []
	});

	test.done();
};

exports['set throws an error if no parameters provided'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	test.throws(function () {
		q.set();
	});

	test.done();
};

exports['set overwrites'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.set({lastlogin: 6});
	q.set({lastlogin: 7});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = ?',
		data: [7]
	});

	test.done();
};

exports['set raw value'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.set({lastlogin: {raw:'NOW()'}});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET lastlogin = NOW()',
		data: []
	});

	test.done();
};

exports['insert called with arguments'] = function (test) {
	var q = queryize().insert({value: false}).into('users', 'u');

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET value = FALSE',
		data: []
	});

	test.done();
};

exports['replace into'] = function (test) {
	var q = queryize().replace({value: false}).into('users', 'u');

	test.deepEqual(q.compile(), {
		query: 'REPLACE INTO `users` u SET value = FALSE',
		data: []
	});

	test.done();
};

exports['multi-insert'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.addRow({lastlogin: 6});
	q.addRow({lastlogin: 10});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u ( lastlogin ) VALUES (?), (?)',
		data: [6, 10]
	});

	test.deepEqual(q._attributes.columns, ['lastlogin']);

	test.done();
};

exports['multi-insert replace'] = function (test) {
	var q = queryize().replace().into('users', 'u');
	
	q.addRow({lastlogin: 6});
	q.addRow({lastlogin: 10});

	test.deepEqual(q.compile(), {
		query: 'REPLACE INTO `users` u ( lastlogin ) VALUES (?), (?)',
		data: [6, 10]
	});

	test.deepEqual(q._attributes.columns, ['lastlogin']);

	test.done();
};


exports['multi-insert, multi-column'] = function (test) {
	var q = queryize().insert().into('users');
	
	q.addRow({name: 'John Doe', age: 26});
	q.addRow({name: 'Bob Smith', age: 32});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` ( name, age ) VALUES (?, ?), (?, ?)',
		data: ['John Doe', 26, 'Bob Smith', 32]
	});

	test.deepEqual(q._attributes.columns, ['name', 'age']);

	test.done();
};

exports['multi-insert w/ raw value'] = function (test) {
	var q = queryize().insert().into('users', 'u');
	
	q.addRow({lastlogin: {raw:'NOW()'}});
	q.addRow({lastlogin: 10});

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u ( lastlogin ) VALUES (NOW()), (?)',
		data: [10]
	});

	test.deepEqual(q._attributes.columns, ['lastlogin']);

	test.done();
};

exports['multi-insert, adding arrays'] = function (test) {
	var q = queryize().insert().into('users');
	
	q.columns('name', 'age');
	q.addRow(['John Doe', 26]);
	q.addRow(['Bob Smith', 32]);

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` ( name, age ) VALUES (?, ?), (?, ?)',
		data: ['John Doe', 26, 'Bob Smith', 32]
	});

	test.deepEqual(q._attributes.columns, ['name', 'age']);

	test.done();
};

exports['multi-insert, adding arrays w/o columns throws'] = function (test) {
	var q = queryize().insert().into('users');
	
	test.throws(function () {
		q.addRow(['John Doe', 26]);
	});

	test.done();
};
