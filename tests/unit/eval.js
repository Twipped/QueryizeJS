
var test = require('tap').test;
var queryize = require('../../');

test('new query receives the eval function', async (t) => {
	t.strictEqual(typeof queryize.evalFunction, 'function', 'queryize.evalFunction is a function');

	const q = queryize();

	t.strictEqual(q._evalFunction, queryize.evalFunction, 'evalFunction has been copied');
});

test('eval with args', async (t) => {
	t.plan(5);
	var q = queryize.select().from('test_table').where({ a: 1 });

	q._evalFunction = (query, data, ...args) => {
		t.strictEqual(query, 'SELECT * FROM `test_table` WHERE a = ?', 'query string matched');
		t.deepEqual(data, [ 1 ], 'data array matched');
		t.deepEqual(args, [ true, 'b' ], 'received passed args');
		return 'RESULT';
	};

	const result = q.eval(true, 'b');

	t.ok(result && typeof result.then === 'function', 'eval returned a promise');
	t.strictEqual(await result, 'RESULT', 'return from eval function passed through');
});

test('then', async (t) => {
	t.plan(4);
	var q = queryize.select().from('test_table').where({ a: 1 });

	q._evalFunction = (query, data, ...args) => {
		t.strictEqual(query, 'SELECT * FROM `test_table` WHERE a = ?', 'query string matched');
		t.deepEqual(data, [ 1 ], 'data array matched');
		t.deepEqual(args, [], 'received passed args');
		return 'RESULT';
	};

	t.strictEqual(await q, 'RESULT', 'return from eval function passed through');
});
