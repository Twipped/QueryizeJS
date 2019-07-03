
var test = require('tap').test;
var queryize = require('../../');

test('from subquery', (t) => {
	var s = queryize().from('users').columns('MIN(date_created)').as('firstsignup');
	var q = queryize().select().from(s);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM (SELECT MIN(date_created) FROM `users`) as `firstsignup`',
		data: [],
	});

	t.end();
});

test('from subquery, with missing table name', (t) => {
	var s = queryize();
	var q = queryize().select();

	t.throws(() => {
		q.from(s);
	});

	t.end();
});

test('from subquery without name', (t) => {
	var s = queryize().from('users').columns('MIN(date_created)');
	var q = queryize().select().from(s);

	var result = q.compile();

	// since the name is pseudo-random, I'm regex matching against the random structure and
	// performing a replacement we can test against.  If the replacement doesn't happen, then
	// the random name didn't work.
	result.query = result.query.replace(/`subquery\w+`/, '`MATCHED`');

	t.deepEqual(result, {
		query: 'SELECT * FROM (SELECT MIN(date_created) FROM `users`) as `MATCHED`',
		data: [],
	});

	t.end();
});

test('from subquery, overriding name', (t) => {
	var s = queryize().from('users').columns('MIN(date_created)').as('firstsignup');
	var q = queryize().select().from(s, 'startdate');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM (SELECT MIN(date_created) FROM `users`) as `startdate`',
		data: [],
	});

	t.end();
});

test('from subquery with data', (t) => {
	var q = queryize()
		.select()
		.from(queryize()
			.select()
			.from('users')
			.as('subquery')
			.where('type', 'Admin'))
		.whereLike('name', 'Bob%');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM (SELECT * FROM `users` WHERE type = ?) as `subquery` WHERE name LIKE ?',
		data: [ 'Admin', 'Bob%' ],
	});

	t.end();
});

test('joining subquery', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join(queryize()
		.select('userid', 'SUM(total_invoice) AS total_invoiced')
		.from('orders')
		.groupBy('userid')
		.as('order_totals'),
	{ on: 'order_totals.userid = u.id' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN (SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` GROUP BY userid) as `order_totals` ON (order_totals.userid = u.id)',
		data: [],
	});

	t.end();
});

test('joining raw subquery', (t) => {
	var q = queryize().select().from('users', 'u');

	q.innerJoin('(SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` JOIN invoices ON (invoices.orderid = order.id) GROUP BY userid) as `order_totals` ON (order_totals.userid = u.id)');

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u INNER JOIN (SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` JOIN invoices ON (invoices.orderid = order.id) GROUP BY userid) as `order_totals` ON (order_totals.userid = u.id)',
		data: [],
	});

	t.end();
});

test('left joining subquery', (t) => {
	var q = queryize().select().from('users', 'u');

	q.leftJoin(queryize()
		.select('userid', 'SUM(total_invoice) AS total_invoiced')
		.from('orders')
		.groupBy('userid')
		.as('order_totals'),
	{ on: 'order_totals.userid = u.id' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u LEFT JOIN (SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` GROUP BY userid) as `order_totals` ON (order_totals.userid = u.id)',
		data: [],
	});

	t.end();
});

test('joining subquery without options', (t) => {
	var q = queryize().select().from('users', 'u');

	t.throws(() => {
		q.join(queryize()
			.select('userid', 'SUM(total_invoice) AS total_invoiced')
			.from('orders')
			.groupBy('userid')
			.as('order_totals'));
	});

	t.end();
});

test('joining subquery with options alias', (t) => {
	var q = queryize().select().from('users', 'u');

	q.join(queryize()
		.select('userid', 'SUM(total_invoice) AS total_invoiced')
		.from('orders')
		.groupBy('userid')
		.as('order_totals'),
	{ on: 'ot.userid = u.id', alias: 'ot' });

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u JOIN (SELECT userid, SUM(total_invoice) AS total_invoiced FROM `orders` GROUP BY userid) as `ot` ON (ot.userid = u.id)',
		data: [],
	});

	t.end();
});

test('column as subquery', (t) => {
	var q = queryize().select().from('users', 'u');

	q.columns(
		'id',
		queryize()
			.select('SUM(total_invoice)')
			.from('orders')
			.groupBy('userid')
			.as('total_invoiced')
	);

	t.deepEqual(q.compile(), {
		query: 'SELECT id, (SELECT SUM(total_invoice) FROM `orders` GROUP BY userid) as `total_invoiced` FROM `users` u',
		data: [],
	});

	t.end();
});

test('column as subquery w/ too many columns', (t) => {
	var q = queryize().select().from('users', 'u');

	t.throws(() => {
		q.columns(
			'id',
			queryize()
				.select('id', 'SUM(total_invoice)')
				.from('orders')
				.groupBy('userid')
				.as('total_invoiced')
		);
	});

	t.end();
});

test('column as subquery w/ default columns', (t) => {
	var q = queryize().select().from('users', 'u');

	t.throws(() => {
		q.columns(
			'id',
			queryize()
				.from('orders')
				.groupBy('userid')
				.as('total_invoiced')
		);
	});

	t.end();
});

test('compound where clause', (t) => {
	var q = queryize().select().from('users', 'u');

	q.where('name', 'John');
	q.where(queryize()
		.where({ type: [ 15, 23 ] })
		.whereInRange('date_created', new Date('2001-04-12'), new Date('2011-04-12'))
	);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u WHERE name = ? AND (type IN (?,?) OR date_created BETWEEN ? AND ?)',
		data: [ 'John', 15, 23, '2001-04-12 00:00:00', '2011-04-12 00:00:00' ],
	});

	t.end();
});

test('compound where clause w/ compound AND', (t) => {
	var q = queryize().select().from('users', 'u');

	q.where('name', 'John');
	q.where(queryize()
		.comparisonMethod('and')
		.where({ type: [ 15, 23 ] })
		.whereInRange('date_created', new Date('2001-04-12'), new Date('2011-04-12'))
	);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u WHERE name = ? AND (type IN (?,?) AND date_created BETWEEN ? AND ?)',
		data: [ 'John', 15, 23, '2001-04-12 00:00:00', '2011-04-12 00:00:00' ],
	});

	t.end();
});

test('compound where clause w/ compound OR', (t) => {
	var q = queryize().select().from('users', 'u');

	q.where('name', 'John');
	q.where(queryize()
		.comparisonMethod('or')
		.where({ type: [ 15, 23 ] })
		.whereInRange('date_created', new Date('2001-04-12'), new Date('2011-04-12'))
	);

	t.deepEqual(q.compile(), {
		query: 'SELECT * FROM `users` u WHERE name = ? AND (type IN (?,?) OR date_created BETWEEN ? AND ?)',
		data: [ 'John', 15, 23, '2001-04-12 00:00:00', '2011-04-12 00:00:00' ],
	});

	t.end();
});
