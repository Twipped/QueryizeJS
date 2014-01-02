
var queryize = require('../queryize');

exports['update without set throws error'] = function (test) {
	var q = queryize().update().table('users', 'u');
	
	test.throws(function () {
		q.compile();
	});

	test.done();
};

exports['basic update'] = function (test) {
	var q = queryize().update().table('users', 'u');
	
	q.set('name', 'bob');

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = ?',
		data: ['bob']
	});

	test.done();
};

exports['basic update with database'] = function (test) {
	var q = queryize().update().database('test', 'users', 'u');
		
	q.set('name', 'bob');

	test.deepEqual(q.compile(), {
		query: 'UPDATE `test`.`users` u SET name = ?',
		data: ['bob']
	});

	test.done();
};

exports['basic update with object to set'] = function (test) {
	var q = queryize().update().table('users', 'u');
	
	q.set({name: 'bob'});

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = ?',
		data: ['bob']
	});

	test.done();
};

exports['update with set value of object throws error'] = function (test) {
	var q = queryize().update().table('users', 'u');
	
	test.throws(function () {
		q.set({name: {blah: 1}});
	});

	test.done();
};

exports['update with a date value'] = function (test) {
	var q = queryize().update().table('users', 'u');
	
	q.set({lastlogin: new Date('2012-01-01')});

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = ?',
		data: ['2012-01-01 00:00:00']
	});

	test.done();
};

exports['update with a number value'] = function (test) {
	var q = queryize().update().table('users', 'u');
	
	q.set({lastlogin: 6});

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = ?',
		data: [6]
	});

	test.done();
};

exports['update with a boolean value'] = function (test) {
	var q = queryize().update().table('users', 'u');
	
	q.set({lastlogin: true});

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET lastlogin = TRUE',
		data: []
	});

	test.done();
};

exports['update with string where clause'] = function (test) {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where('id = 1');
		
	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = 1',
		data: []
	});

	test.done();
};

exports['update with two argument where clause'] = function (test) {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where('id', 1);
		
	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = ?',
		data: [1]
	});

	test.done();
};


exports['update with object where clause'] = function (test) {
	var q = queryize().update().from('users');

	q.set('lastlogin = NOW()');
	q.where({id:1});
		
	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` SET lastlogin = NOW() WHERE id = ?',
		data: [1]
	});

	test.done();
};