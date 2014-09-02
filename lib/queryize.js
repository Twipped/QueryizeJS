var extend = require('lodash.assign');
var mapValues = require('lodash.mapvalues');
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

	//bind all mutators directly to query
	var proto = mapValues(mutators, function (fn) { return typeof fn === 'function' ? fn.bind(query) : fn; });

	//mix in the bound mutators
	extend(query, proto);

	query._constructor = queryize;
	query._isQueryizeObject = true;
	query._attributes = {
		debugEnabled: false,
		database: false,
		tableName: false,
		alias: false,
		dataBindings: {},
		useBoundParameters: queryize.useBoundParameters,
		where: [],
		whereBoolean: ' AND ',
		set: [],
		columns: ['*'],
		joins: [],
		orderBy: false,
		groupBy: false,
		distinct: false,
		limit: false,
		builder: false
	};

	if (original) {
		if (original._isQueryizeObject) {
			extend(query._attributes, original.export());
		} else if (typeof original === 'object') {
			extend(query._attributes, original);
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
queryize.select = function () {
	var q = queryize();
	q.select.apply(q, arguments);
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
queryize.update = function () {
	var q = queryize();
	q.update.apply(q, arguments);
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
queryize.insert = function () {
	var q = queryize();
	q.insert.apply(q, arguments);
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
queryize.delete = function () {
	var q = queryize();
	q.deleteFrom.apply(q, arguments);
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


module.exports = queryize;

