
var test = require('tap').test;
var queryize = require('../../');

test('from subquery', (test) => {
	var s = queryize().from('users').columns('MIN(date_created)').as('firstsignup');
	var q = queryize().select().from(s);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM (SELECT MIN(date_created) FROM `users`) as `firstsignup`',
		data: []
	});

	test.end();
});

test('from subquery, with missing table name', (test) => {
	var s = queryize();
	var q = queryize().select();

	test.throws(function () {
		q.from(s);
	});

	test.end();
});

test('from subquery without name', (test) => {
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

	test.end();
});

test('from subquery, overriding name', (test) => {
	var s = queryize().from('users').columns('MIN(date_created)').as('firstsignup');
	var q = queryize().select().from(s, 'startdate');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM (SELECT MIN(date_created) FROM `users`) as `startdate`',
		data: []
	});

	test.end();
});

test('from subquery with data', (test) => {
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
		data: [ 'Admin', 'Bob%' ]
	});

	test.end();
});

test('joining subquery', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join(queryize()
		.select('userid', 'SUM(total_invoice) AS total_invoiced')
		.from('orders')
		.groupBy('userid')
		.as('order_totals'),
	{ on: 'order_totals.userid = u.id' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN (SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` GROUP BY userid) as `order_totals` ON (order_totals.userid = u.id)',
		data: []
	});

	test.end();
});

test('joining raw subquery', (test) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('(SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` JOIN invoices ON (invoices.orderid = order.id) GROUP BY userid) as `order_totals` ON (order_totals.userid = u.id)');

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN (SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` JOIN invoices ON (invoices.orderid = order.id) GROUP BY userid) as `order_totals` ON (order_totals.userid = u.id)',
		data: []
	});

	test.end();
});

test('left joining subquery', (test) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin(queryize()
		.select('userid', 'SUM(total_invoice) AS total_invoiced')
		.from('orders')
		.groupBy('userid')
		.as('order_totals'),
	{ on: 'order_totals.userid = u.id' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN (SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` GROUP BY userid) as `order_totals` ON (order_totals.userid = u.id)',
		data: []
	});

	test.end();
});

test('joining subquery without options', (test) => {
	var q = queryize().select().from('users', 'u');

	test.throws(function () {
		q.join(queryize()
			.select('userid', 'SUM(total_invoice) AS total_invoiced')
			.from('orders')
			.groupBy('userid')
			.as('order_totals'));
	});

	test.end();
});

test('joining subquery with options alias', (test) => {
	var q = queryize().select().from('users', 'u');

	q.join(queryize()
		.select('userid', 'SUM(total_invoice) AS total_invoiced')
		.from('orders')
		.groupBy('userid')
		.as('order_totals'),
	{ on: 'ot.userid = u.id', alias: 'ot' });

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN (SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` GROUP BY userid) as `ot` ON (ot.userid = u.id)',
		data: []
	});

	test.end();
});

test('column as subquery', (test) => {
	var q = queryize().select().from('users', 'u');

	q.columns(
		'id',
		queryize()
			.select('SUM(total_invoice)')
			.from('orders')
			.groupBy('userid')
			.as('total_invoiced')
	);

	test.deepEqual(q.compile(), {
		query: 'SELECT id, (SELECT SUM(total_invoice) FROM `orders` GROUP BY userid) as `total_invoiced` FROM `users` u',
		data: []
	});

	test.end();
});

test('column as subquery w/ too many columns', (test) => {
	var q = queryize().select().from('users', 'u');

	test.throws(function () {
		q.columns(
			'id',
			queryize()
				.select('id', 'SUM(total_invoice)')
				.from('orders')
				.groupBy('userid')
				.as('total_invoiced')
		);
	});

	test.end();
});

test('column as subquery w/ default columns', (test) => {
	var q = queryize().select().from('users', 'u');

	test.throws(function () {
		q.columns(
			'id',
			queryize()
				.from('orders')
				.groupBy('userid')
				.as('total_invoiced')
		);
	});

	test.end();
});

test('compound where clause', (test) => {
	var q = queryize().select().from('users', 'u');

	q.where('name', 'John');
	q.where(queryize()
		.where({ type: [ 15, 23 ] })
		.whereInRange('date_created', new Date('2001-04-12'), new Date('2011-04-12'))
	);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u WHERE name = ? AND (type IN (?,?) OR date_created BETWEEN ? AND ?)',
		data: [ 'John', 15, 23, '2001-04-12 00:00:00', '2011-04-12 00:00:00' ]
	});

	test.end();
});

test('compound where clause w/ compound AND', (test) => {
	var q = queryize().select().from('users', 'u');

	q.where('name', 'John');
	q.where(queryize()
		.comparisonMethod('and')
		.where({ type: [ 15, 23 ] })
		.whereInRange('date_created', new Date('2001-04-12'), new Date('2011-04-12'))
	);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u WHERE name = ? AND (type IN (?,?) AND date_created BETWEEN ? AND ?)',
		data: [ 'John', 15, 23, '2001-04-12 00:00:00', '2011-04-12 00:00:00' ]
	});

	test.end();
});

test('compound where clause w/ compound OR', (test) => {
	var q = queryize().select().from('users', 'u');

	q.where('name', 'John');
	q.where(queryize()
		.comparisonMethod('or')
		.where({ type: [ 15, 23 ] })
		.whereInRange('date_created', new Date('2001-04-12'), new Date('2011-04-12'))
	);

	test.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u WHERE name = ? AND (type IN (?,?) OR date_created BETWEEN ? AND ?)',
		data: [ 'John', 15, 23, '2001-04-12 00:00:00', '2011-04-12 00:00:00' ]
	});

	test.end();
});
