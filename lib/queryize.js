var mutators = require('./mutators.js');

/**
 * Creates a `query` object which encapsulates the state of the query to be generated
 * and provides the methods to manipulate that query.
 *
 * @name queryize
 * @typedef queryize
 * @constructor
 * @param  {query|Object} [original] An existing query object to duplicate.
 * @return {query} Returns a `query` instance.
 * @example
 * var queryize = require('queryize');
 * var query = queryize();
 */
var queryize = function (original) {
	var query = {};

	// bind all mutators directly to query
	for (const [ key, fn ] of Object.entries(mutators)) {
		query[key] = (typeof fn === 'function' ? fn.bind(query) : fn);
	}

	query._constructor = queryize;
	query._isQueryizeObject = true;
	query._attributes = {
		debugEnabled: false,
		database: false,
		tableName: false,
		fromSubquery: false,
		alias: false,
		dataBindings: {},
		useBoundParameters: queryize.useBoundParameters,
		where: [],
		whereBoolean: null,
		set: [],
		setKeys: {},
		columns: [ '*' ],
		joins: [],
		orderBy: false,
		groupBy: false,
		distinct: false,
		limit: false,
		asName: false,
		builder: false,
	};

	if (original) {
		if (original._isQueryizeObject) {
			Object.assign(query._attributes, original.export());
		} else if (typeof original === 'object') {
			Object.assign(query._attributes, original);
		}
	}

	return query;
};

/**
 * Shortcut for creating a new select query
 *
 * See `query.select()` for details.
 *
 * @static
 * @memberOf queryize
 * @return {query} Returns a `query` instance.
 */
queryize.select = function (...args) {
	var q = queryize();
	q.select(...args);
	return q;
};

/**
 * Shortcut for creating a new update query
 *
 * See `query.update()` for details.
 *
 * @static
 * @memberOf queryize
 * @return {query} Returns a `query` instance.
 */
queryize.update = function (...args) {
	var q = queryize();
	q.update(...args);
	return q;
};

/**
 * Shortcut for creating a new insert query
 *
 * See `query.insert()` for details.
 *
 * @static
 * @memberOf queryize
 * @return {query} Returns a `query` instance.
 */
queryize.insert = function (...args) {
	var q = queryize();
	q.insert(...args);
	return q;
};

/**
 * Shortcut for creating a new replace query
 *
 * See `query.replace()` for details.
 *
 * @static
 * @memberOf queryize
 * @return {query} Returns a `query` instance.
 */
queryize.replace = function (...args) {
	var q = queryize();
	q.replace(...args);
	return q;
};

/**
 * Shortcut for creating a new delete query
 *
 * See `query.select()` for details.
 *
 * @static
 * @memberOf queryize
 * @name delete
 * @alias deleteFrom
 * @return {query} Returns a `query` instance.
 */
queryize.delete = function (...args) {
	var q = queryize();
	q.deleteFrom(...args);
	return q;
};

queryize.deleteFrom = queryize.delete;

/**
 * Globally controls if new queries will use bound params by default.
 * @memberOf queryize
 * @name useBoundParameters
 * @abstract
 * @type {Boolean}
 * @example
 * //disable bound params. This is not recommended
 * queryize.useBoundParameters = false;
 */
queryize.useBoundParameters = true;

/**
 * Public access point for adding functions to query objects
 * @memberOf queryize
 * @abstract
 * @type {Object}
 * @example
 * queryize.fn.someNewFunction = function () {
 *   //`this` is the current query, use `this._attributes` to store query parameters
 * };
 */
queryize.fn = mutators;

module.exports = exports = queryize;
