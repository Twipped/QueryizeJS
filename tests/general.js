
var queryize = require('../queryize');

exports['requirement'] = function (test) {
	test.strictEqual(typeof queryize, 'function', 'queryize is a function');
	test.done();
};

exports['compile without method throws error'] = function (test) {
	var q = queryize();

	test.throws(function () {
		q.compile();
	});

	test.done();
};

exports['compile without table throws error'] = function (test) {
	var q = queryize().select();

	test.throws(function () {
		q.compile();
	});

	test.done();
};

exports['basic select, copied'] = function (test) {
	var a = queryize().select().from('users', 'u');

	var b = queryize(a);
		
	test.deepEqual(b.compile(), {
		query: 'SELECT * FROM `users` u',
		data: []
	});

	test.done();
};

exports['basic select from shortcut'] = function (test) {
	var q = queryize.select().from('users', 'u');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u',
		data: []
	});

	test.done();
};

exports['basic update from shortcut'] = function (test) {
	var q = queryize.update().table('users', 'u');
	
	q.set('name', 'bob');
	q.where('name', null);

	test.deepEqual(q.compile(), {
		query: 'UPDATE `users` u SET name = ? WHERE name = NULL',
		data: ['bob']
	});

	test.done();
};

exports['basic insert from shortcut'] = function (test) {
	var q = queryize.insert().into('users', 'u');
	
	q.set('name', 'bob');

	test.deepEqual(q.compile(), {
		query: 'INSERT INTO `users` u SET name = ?',
		data: ['bob']
	});

	test.done();
};

exports['basic delete from shortcut'] = function (test) {
	var q = queryize.deleet().from('users', 'u');
	
	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: []
	});

	test.done();
};

exports['basic deleteFrom from shortcut'] = function (test) {
	var q = queryize.deleteFrom('users', 'u');
	
	q.where('id = 1');

	test.deepEqual(q.compile(), {
		query: 'DELETE FROM `users` u WHERE id = 1',
		data: []
	});

	test.done();
};
