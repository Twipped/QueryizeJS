
var queryize = require('../queryize');
var EventEmitter = require('events').EventEmitter;

var mockConnection = function (test, expectedQuery, expectedData, returnValue, fails) {
	return {
		query: function (query, data, callback) {
			if (expectedQuery !== undefined) {test.strictEqual(query, expectedQuery);}
			if (expectedData !== undefined) {test.deepEqual(data, expectedData);}
			test.ok(true);
			callback(fails, returnValue);
			return new EventEmitter();
		}
	};
};

exports['exec with callback, calls query'] = function (test) {
	test.expect(4);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(test, 'SELECT * FROM `test_table`', [], [{name: 'John'}]);

	q.exec(conn, function (err, results) {
		test.deepEqual(results, [{name: 'John'}]);
		test.done();
	});
};

exports['exec with callback and options, calls query'] = function (test) {
	test.expect(4);
	var q = queryize.select().from('test_table');

	var conn = {
		query: function (options, callback) {
			test.deepEqual(options, {
				sql: 'SELECT * FROM `test_table`',
				values: []
			});
			test.deepEqual(options.__proto__, {
				sql: 'FOO',
				bar: 42
			});
			test.ok(true);
			callback(false, [{name: 'John'}]);
			return new EventEmitter();
		}
	};

	var options = {
		sql: 'FOO',
		bar: 42
	};

	q.exec(conn, options, function (err, results) {
		test.deepEqual(results, [{name: 'John'}]);
		test.done();
	});
};

exports['exec with callback, calls execute'] = function (test) {
	test.expect(4);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(test, 'SELECT * FROM `test_table`', [], [{name: 'John'}]);

	conn.execute = conn.query;
	conn.query = function () {
		test.ok(false, 'called .query instead of .execute');
	};

	q.exec(conn, function (err, results) {
		test.deepEqual(results, [{name: 'John'}]);
		test.done();
	});
};

exports['exec with promise (resolves), calls query'] = function (test) {
	test.expect(4);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(test, 'SELECT * FROM `test_table`', [], [{name: 'John'}]);

	var thenable = q.exec(conn);

	// test.strictEqual(typeof thenable.then, 'function');
	// test.strictEqual(typeof thenable.catch, 'function');
	// test.notEqual(thenable.then, thenable.catch);
	thenable.then(function (results) {
		test.deepEqual(results, [{name: 'John'}]);
		test.done();
	}).catch(function (err) {
		test.ok(false, 'promise rejected');
		test.done();
	});
};

exports['exec with promise (rejects), calls execute'] = function (test) {
	test.expect(4);
	var q = queryize.select().from('test_table');
	var conn = mockConnection(test, 'SELECT * FROM `test_table`', [], [{name: 'John'}], 'FAIL');

	conn.execute = conn.query;
	conn.query = function () {
		test.ok(false, 'called .query instead of .execute');
	};

	var thenable = q.exec(conn);

	// test.strictEqual(typeof thenable.then, 'function');
	// test.strictEqual(typeof thenable.catch, 'function');
	// test.notEqual(thenable.then, thenable.catch);
	thenable.then(function (results) {
		test.ok(false, 'promise resolves');
		test.done();
	}).catch(function (err) {
		test.strictEqual(err, 'FAIL');
		test.done();
	});
};