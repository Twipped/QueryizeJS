
var test = require('tap').test;
var mktmpio = require('../lib/mktmpio');
var mysql2 = require('mysql2');
var Promise = require('bluebird');
var queryize = require('../../');

var pool;

test('mysql2 integration', async (t) => {
	const db = await mktmpio.create();

	t.comment(`Database created: --user=root --password=${db.password} --host=${db.host} --port=${db.port}`);

	pool = mysql2.createPool({
		host: db.host,
		port: db.port,
		user: 'root',
		password: db.password,
		database: 'test_data',
	});

	t.tearDown(async () => {
		await new Promise((resolve) => {
			t.comment('Disconnecting');
			pool.end(resolve);
		});

		await mktmpio.destroy();
		t.comment('Database destroyed');
	});

	await mktmpio.populate();

	t.comment('Database populated');

	const q = queryize
		.select('first_name', 'last_name')
		.from('employees')
		.limit(1)
		.orderBy('emp_no');

	q._evalFunction = (query, data) => new Promise((resolve, reject) => {
		pool.query(query, data, (err, result) => (
			err ? reject(err) : resolve(result)
		));
	});

	t.test('simple select', async (t2) => {
		const results = await q.eval();
		t2.deepEqual([].concat(results), [
			{ first_name: 'Georgi', last_name: 'Facello' },
		]);
	});
});
