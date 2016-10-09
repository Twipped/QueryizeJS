
var test = require('tap').test;
var mktmpio = require('../lib/mktmpio');
var mysql2 = require('mysql2');
var Promise = require('bluebird');
var queryize = require('../../');

var pool;

test('mysql2 integration', (t) => mktmpio.create().then((db) => {
	t.comment(`Database created: --user=root --password=${db.password} --host=${db.host} --port=${db.port}`);

	pool = mysql2.createPool({
		host: db.host,
		port: db.port,
		user: 'root',
		password: db.password,
		database: 'test_data'
	});

	t.tearDown(() => {
		return new Promise((resolve) => {
			t.comment('Disconnecting');
			pool.end(resolve);
		})
			.then(() => mktmpio.destroy())
			.then(() => t.comment('Database destroyed'));
	});

	return mktmpio.populate().then(() => {
		t.comment('Database populated');

		t.test('simple select', (t) => {
			return queryize
				.select('first_name', 'last_name')
				.from('employees')
				.limit(1)
				.orderBy('emp_no')
				.exec(pool)
				.then((results) => {
					t.deepEqual([].concat(results), [
						{ first_name: 'Georgi', last_name: 'Facello' }
					]);
				});
		});
	});
}));
