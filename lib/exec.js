/* eslint promise/no-native: 0 max-len:0 */

/**
 * Compiles the MySQL query and runs it using the provided connection or connection pool from node-mysql or node-mysql2.
 *
 * @deprecated removed 3.0, must now be added as a plugin
 * @memberOf query
 * @category Evaluation
 * @param  {Object}   connection node-mysql(2) connection(Pool)
 * @param  {Object}   [options]  Options object to be passed to `connection.query` with the query string and data mixed in.
 * @param  {Function} [callback] Callback function to be invoked when the query completes.
 * @return {nodeMysqlQuery} Returns a promise extended node-mysql(2) query emitter.
 * @example
 * var connection = require('mysql').createConnection('mysql://dev@localhost/testdb');
 * @example
 * // query exec used with callback
 * queryize()
 *   .select()
 *   .from('employees')
 *   .orderBy('lastname', 'firstname')
 *   .exec(connection, function (err, employees) {
 *     if (err) console.error(err);
 *     else console.log(employees);
 *   });
 * @example
 * // query exec used as promise
 * queryize()
 *   .select()
 *   .from('employees')
 *   .orderBy('lastname', 'firstname')
 *   .exec(connection)
 *     .then(function (employees) {
 *       console.log(employees);
 *     })
 *     .catch(function (err) {
 *       console.error(err);
 *     });
 * @example
 * // insert query exec with insert id
 * queryize()
 *   .insert({
 *     name: 'John Doe',
 *     birthdate: new Date('1992-05-20')
 *   })
 *   .into('employees')
 *   .exec(connection)
 *     .then(function (response) {
 *       console.log(response.insertId);
 *     });
 */

module.exports = exports = function exec (connection, options, callback) {
	var q = this.compile();
	if (this._attributes.debugEnabled) console.log(q); // eslint-disable-line no-console

	// if the second argument is a callback, remap the arguments
	if (!callback && typeof options === 'function') {
		callback = options;
		options = null;

	// if the second argument is an options object, wrap it and apply our query & data to it.
	} else if (typeof options === 'object') {
		options = Object.assign({}, options, {
			sql: q.query,
			values: q.data,
		});
	}

	var callable;
	const promise = new Promise((resolve, reject) => {
		callable = function (err, data) {
			if (callback) {
				callback(err, data);
			}

			if (err) {
				reject(err);
			}

			resolve(data);
		};
	});

	if (typeof connection.query !== 'function') {
		callable(new TypeError('Connection object is not a mysql or mysql2 connection or pool.'));
		return promise;
	}

	if (options) {
		connection.query(options, callable);
	} else {
		connection.query(q.query, q.data, callable);
	}

	return promise;
};
