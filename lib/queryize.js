var extend = require('lodash.assign');
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

	var query = Object.create(mutators);
	query._constructor = queryize;
	query._isQueryizeObject = true;
	query._attributes = {
		debugEnabled: false,
		database: false,
		tableName: false,
		tableAlias: false,
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

queryize.useBoundParameters = true;

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
 * @alias deleet
 * @return {query} Returns a `query` instance.
 */
queryize.deleteFrom = function () {
	var q = queryize();
	q.deleteFrom.apply(q, arguments);
	return q;
};

queryize.deleet = queryize.deleteFrom;

module.exports = queryize;

