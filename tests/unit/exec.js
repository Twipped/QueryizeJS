
var test = require('tap').test;
var queryize = require('../../');

var mockConnection = function (t, expectedQuery, expectedData, returnValue, fails) {
	return {
		query (query, data, callback) {
			t.pass('connection.query was called');
			if (expectedQuery !== undefined) { t.strictEqual(query, expectedQuery, 'with expected query text'); }
			if (expectedData !== undefined) { t.deepEqual(data, expectedData, 'and expected query data'); }
			callback(fails, returnValue);
		},
	};
};

test('exec with callback, calls query', (t) => {
	t.plan(5);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(t, 'SELECT * FROM `test_table`', [], [ { name: 'John' } ]);

	q.exec(conn, (err, results) => {
		t.error(err);
		t.deepEqual(results, [ { name: 'John' } ], 'expected results');
		t.end();
	});
});

test('exec with callback and options, calls query with options', (t) => {
	t.plan(4);
	var q = queryize.select().from('test_table');

	var conn = {
		query (options, callback) {
			t.pass('connection.query was called');
			t.deepEqual(options, {
				sql: 'SELECT * FROM `test_table`',
				values: [],
				bar: 42,
			}, 'with the correct options object');

			callback(false, [ { name: 'John' } ]);
		},
	};

	var options = {
		sql: 'FOO',
		bar: 42,
	};

	q.exec(conn, options, (err, results) => {
		t.error(err);
		t.deepEqual(results, [ { name: 'John' } ]);
		t.end();
	});
});

test('exec with promise (resolves)', (t) => {
	t.plan(4);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(t, 'SELECT * FROM `test_table`', [], [ { name: 'John' } ]);

	return q.exec(conn)
		.then((results) => t.deepEqual(results, [ { name: 'John' } ]));
});

test('exec with promise (rejects)', (t) => {
	t.plan(4);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(t, 'SELECT * FROM `test_table`', [], [ { name: 'John' } ], 'FAIL');

	var thenable = q.exec(conn);

	return thenable
		.then(() => t.fail('promise resolved'))
		.catch((err) => t.equal(err, 'FAIL'));
});
