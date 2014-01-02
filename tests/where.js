
var queryize = require('../queryize');

exports['select with string where clause'] = function (test) {
	var q = queryize().select().from('users');

	q.where('id = 1');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = 1',
		data: []
	});

	test.done();
};

exports['select with two argument where clause'] = function (test) {
	var q = queryize().select().from('users');

	q.where('id', 1);
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [1]
	});

	test.done();
};

exports['select with two argument where clause and operator'] = function (test) {
	var q = queryize().select().from('users');

	q.where('id', 1, '>');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id > ?',
		data: [1]
	});

	test.done();
};

exports['select with two argument where clause containing value array'] = function (test) {
	var q = queryize().select().from('users');

	q.where('name', ['bob', 'jane']);
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name IN (?,?)',
		data: ['bob', 'jane']
	});

	test.done();
};

exports['select with two argument where clause containing value array and !='] = function (test) {
	var q = queryize().select().from('users');

	q.where('name', ['bob', 'jane'], '!=');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT IN (?,?)',
		data: ['bob', 'jane']
	});

	test.done();
};

exports['select with two argument where clause containing value array and non-equality operator'] = function (test) {
	var q = queryize().select().from('users');

	q.where('name', ['bob', 'jane'], 'LIKE');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (name LIKE ? OR name LIKE ?)',
		data: ['bob', 'jane']
	});

	test.done();
};

exports['select with two argument where clause containing field array'] = function (test) {
	var q = queryize().select().from('users');

	q.where(['firstname', 'lastname'], 'bob');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (firstname = ? OR lastname = ?)',
		data: ['bob', 'bob']
	});

	test.done();
};

exports['select with object where clause'] = function (test) {
	var q = queryize().select().from('users');

	q.where({id:1});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id = ?',
		data: [1]
	});

	test.done();
};

exports['select with 2 item object where clause'] = function (test) {
	var q = queryize().select().from('users');

	q.where({id:1, name: 'bob'});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name = ?)',
		data: [1, 'bob']
	});

	test.done();
};

exports['select with object where clause containing value array'] = function (test) {
	var q = queryize().select().from('users');

	q.where({name: ['bob', 'jane']});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name IN (?,?)',
		data: ['bob', 'jane']
	});

	test.done();
};

exports['select with 2 item object where clause with negation'] = function (test) {
	var q = queryize().select().from('users');

	q.where({id:1, not: true, name: 'bob'});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name != ?)',
		data: [1, 'bob']
	});

	test.done();
};

exports['select with object where clause with negation and a value array'] = function (test) {
	var q = queryize().select().from('users');

	q.where({not: true, name: ['bob', 'jane']});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT IN (?,?)',
		data: ['bob', 'jane']
	});

	test.done();
};

exports['select with double 2 item object where clause'] = function (test) {
	var q = queryize().select().from('users');

	q.where({id:1, name: 'bob'});
	q.where({active: true, email: 'bob@bob.com'});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE (id = ? AND name = ?) AND (active = TRUE AND email = ?)',
		data: [1, 'bob', 'bob@bob.com']
	});

	test.done();
};


exports['select with object where clause and operator'] = function (test) {
	var q = queryize().select().from('users');

	q.where({id:1}, null, '>');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id > ?',
		data: [1]
	});

	test.done();
};


exports['select with whereLike'] = function (test) {
	var q = queryize().select().from('users');

	q.whereLike('name', 'bob%');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name LIKE ?',
		data: ['bob%']
	});

	test.done();
};

exports['select with whereLike object'] = function (test) {
	var q = queryize().select().from('users');

	q.whereLike({'name':'bob%'});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name LIKE ?',
		data: ['bob%']
	});

	test.done();
};

exports['select with whereNotLike'] = function (test) {
	var q = queryize().select().from('users');

	q.whereNotLike('name', 'bob%');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT LIKE ?',
		data: ['bob%']
	});

	test.done();
};

exports['select with whereNotLike object'] = function (test) {
	var q = queryize().select().from('users');

	q.whereNotLike({'name':'bob%'});
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE name NOT LIKE ?',
		data: ['bob%']
	});

	test.done();
};

exports['select with whereBetween'] = function (test) {
	var q = queryize().select().from('users');

	q.whereBetween('id', 5, 10);
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id BETWEEN ? AND ?',
		data: [5, 10]
	});

	test.done();
};

exports['select with whereInRange'] = function (test) {
	var q = queryize().select().from('users');

	q.whereInRange('id', 5, 10);
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id BETWEEN ? AND ?',
		data: [5, 10]
	});

	test.done();
};


exports['select with whereInRange, without end'] = function (test) {
	var q = queryize().select().from('users');

	q.whereInRange('id', 5, null);
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id >= ?',
		data: [5]
	});

	test.done();
};

exports['select with whereInRange, without beginning'] = function (test) {
	var q = queryize().select().from('users');

	q.whereInRange('id', null, 10);
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE id <= ?',
		data: [10]
	});

	test.done();
};

exports['select with whereInRange using dates'] = function (test) {
	var q = queryize().select().from('users');

	q.whereInRange('lastlogin', new Date('2013-01-01'), new Date('2014-01-01'));
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` WHERE lastlogin BETWEEN ? AND ?',
		data: ['2013-01-01 00:00:00', '2014-01-01 00:00:00']
	});

	test.done();
};