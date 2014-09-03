
var queryize = require('../queryize');

exports['from subquery'] = function (test) {
	var s = queryize().from('users').columns('MIN(date_created)').as('firstsignup');
	var q = queryize().select().from(s);
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM (SELECT MIN(date_created) FROM `users`) as `firstsignup`',
		data: []
	});

	test.done();
};

exports['from subquery without name'] = function (test) {
	var s = queryize().from('users').columns('MIN(date_created)');
	var q = queryize().select().from(s);
	
	var result = q.compile();

	// since the name is pseudo-random, I'm regex matching against the random structure and
	// performing a replacement we can test against.  If the replacement doesn't happen, then
	// the random name didn't work.
	result.query = result.query.replace(/`subquery\w+`/, '`MATCHED`');

	test.deepEqual(result, {
		query: 'SELECT * FROM (SELECT MIN(date_created) FROM `users`) as `MATCHED`',
		data: []
	});

	test.done();
};

exports['from subquery, overriding name'] = function (test) {
	var s = queryize().from('users').columns('MIN(date_created)').as('firstsignup');
	var q = queryize().select().from(s, 'startdate');
		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM (SELECT MIN(date_created) FROM `users`) as `startdate`',
		data: []
	});

	test.done();
};

exports['from subquery with data'] = function (test) {
	var q = queryize()
		.select()
		.from(queryize()
			.select()
			.from('users')
			.as('subquery')
			.where('type', 'Admin'))
		.whereLike('name', 'Bob%');

		
	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM (SELECT * FROM `users` WHERE type = ?) as `subquery` WHERE name LIKE ?',
		data: ['Admin', 'Bob%']
	});

	test.done();
};