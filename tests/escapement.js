
var queryize = require('../queryize');

exports['basic select with value in columns'] = function (test) {
	var q = queryize().disableBoundParameters().select().from('users');

	q.columns('columnA', 3, 'columnC');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT columnA, 3, columnC FROM `users`',
		data: []
	});

	test.done();
};

exports['select with 2 item object where clause'] = function (test) {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({id:1, name: 'bob'});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = 1 AND name = \'bob\')',
		data: []
	});

	test.done();
};

exports['select with injection attempt'] = function (test) {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({name: 'x\' AND email IS NULL; --'});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name = \'x\\\' AND email IS NULL; --\'',
		data: []
	});

	test.done();
};

exports['select with injection attempt, part 2'] = function (test) {
	var q = queryize().disableBoundParameters().select().from('users');

	q.where({name: 'x" AND email IS NULL; --'});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name = \'x\\\" AND email IS NULL; --\'',
		data: []
	});

	test.done();
};

exports['select with object, throws error'] = function (test) {
	var q = queryize().disableBoundParameters().select().from('users');

	test.throws(function () {
		q.where({name: {}});
	});
		
	test.done();
};