
var test = require('tap').test;
var queryize = require('../');

var mockConnection = function (test, expectedQuery, expectedData, returnValue, fails) {
	return {
		query: function (query, data, callback) {
			test.pass('connection.query was called');
			if (expectedQuery !== undefined) { test.strictEqual(query, expectedQuery, 'with expected query text'); }
			if (expectedData !== undefined) { test.deepEqual(data, expectedData, 'and expected query data'); }
			callback(fails, returnValue);
		}
	};
};

test('exec with callback, calls query', (test) => {
	test.plan(5);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(test, 'SELECT * FROM `test_table`', [], [ { name: 'John' } ]);

	q.exec(conn, function (err, results) {
		test.error(err);
		test.deepEqual(results, [ { name: 'John' } ], 'expected results');
		test.end();
	});
});

test('exec with callback and options, calls query with options', (test) => {
	test.plan(4);
	var q = queryize.select().from('test_table');

	var conn = {
		query: function (options, callback) {
			test.pass('connection.query was called');
			test.deepEqual(options, {
				sql: 'SELECT * FROM `test_table`',
				values: [],
				bar: 42
			}, 'with the correct options object');

			callback(false, [ { name: 'John' } ]);
		}
	};

	var options = {
		sql: 'FOO',
		bar: 42
	};

	q.exec(conn, options, function (err, results) {
		test.error(err);
		test.deepEqual(results, [ { name: 'John' } ]);
		test.end();
	});
});

test('exec with promise (resolves)', (test) => {
	test.plan(4);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(test, 'SELECT * FROM `test_table`', [], [ { name: 'John' } ]);

	return q.exec(conn)
		.then((results) => test.deepEqual(results, [ { name: 'John' } ]));
});

test('exec with promise (rejects)', (test) => {
	test.plan(4);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(test, 'SELECT * FROM `test_table`', [], [ { name: 'John' } ], 'FAIL');

	var thenable = q.exec(conn);

	return thenable
		.then((results) => test.fail('promise resolved'))
		.catch((err) => test.equal(err, 'FAIL'));
});
