
var test = require('tap').test;
var queryize = require('../');

test('basic select with value in columns', (test) => {
	var q = queryize().disableBoundParameters().select().from('users');

	q.columns('columnA', 3, 'columnC');

	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, 3, columnC FROM `users`',
		data: []
	});

	test.done();
});

test('select with 2 item object where clause', (test) => {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({id: 1, name: 'bob'});

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = 1 AND name = \'bob\')',
		data: []
	});

	test.end();
});

test('select with injection attempt', (test) => {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({name: 'x\' AND email IS NULL; --'});

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name = \'x\\\' AND email IS NULL; --\'',
		data: []
	});

	test.end();
});

test('select with injection attempt, part 2', (test) => {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({name: 'x" AND email IS NULL; --'});

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name = \'x\\" AND email IS NULL; --\'',
		data: []
	});

	test.end();
});

test('select with object, throws error', (test) => {
	var q = queryize().disableBoundParameters().select().from('users');

	test.throws(function () {
		q.where({name: {}});
	});

	test.end();
});
