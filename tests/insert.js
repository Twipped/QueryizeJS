
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

exports['insert called with arguments'] = function (test) {
	var q = queryize().insert({value: false}).into('users', 'u');

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET value = FALSE',
		data: []
	});

	test.done();
};

