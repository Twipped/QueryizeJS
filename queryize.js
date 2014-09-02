var extend = require('lodash.assign');
var clone = require('lodash.clone');
var proxmis = require('proxmis');
var idCounter = 0;

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

	var useBoundParameters = queryize.useBoundParameters;

	var attributes = {
		debugEnabled: false,
		database: false,
		tableName: false,
		tableAlias: false,
		dataBindings: {},
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

	if (original) extend(attributes, original._isQueryizeObject ? original.export() : original);

	/**
	 * @typedef compiledQuery
	 * @type {Object}
	 * @property {string} query The query string ready for sending to mysql
	 * @property {Array<string|number>} data All bound data values for the query, in order of the corrusponding placeholder questionmark in the query string.
	 */

	/**
	 * Processes the freshly compiled query string, replacing all data bindings with placeholders and constructs the data array
	 * If useBoundParameters is turned off, it replaces the placeholders with their escaped values.
	 * @private
	 * @param  {string} queryString The query string to be processed
	 * @return {compiledQuery} The processed query
	 */
	function _convertNamedParameters (queryString) {
		var data = [];

		if (useBoundParameters) {
			queryString = queryString.replace(/({{\w*}})/g, function (match, name) {
				if (attributes.dataBindings[name] === undefined) throw new Error('The data binding '+name+' could not be found.');

				data.push(attributes.dataBindings[name]);

				return '?';
			});
		} else {
			queryString = queryString.replace(/({{\w*}})/g, function (match, name) {
				if (attributes.dataBindings[name] === undefined) throw new Error('The data binding '+name+' could not be found.');

				return _escapeValue(attributes.dataBindings[name]);
			});
		}

		return {
			query: queryString,
			data: data
		};
	}

	/**
	 * Escapes a value for use in a MySQL query without SQL injection
	 * @private
	 * @param  {*} value The value to be escaped
	 * @return {string|number} The escaped value ready to be used in a query.
	 */
	function _escapeValue(value) {
		if (value === undefined || value === null) {
			return 'NULL';
		}

		switch (typeof value) {
			case 'boolean': return (value) ? 'true' : 'false';
			case 'number': return value+'';
		}

		if (value instanceof Date) {
			value = data.toISOString().slice(0, 19).replace('T', ' ');
		}

		if (typeof value === 'object') {
			throw new TypeError('Cannot escape object');
		}

		value = value.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
			switch(s) {
				case "\0": return "\\0";
				case "\n": return "\\n";
				case "\r": return "\\r";
				case "\b": return "\\b";
				case "\t": return "\\t";
				case "\x1a": return "\\Z";
				default: return "\\"+s;
			}
		});

		return "'"+value+"'";
	}
	
	/**
	 * Stores the passed `value` under a data binding with the `key` name.
	 * This allows for explicit usage of bindings within query strings.
	 *
	 * @memberOf query
	 * @category Data
	 * @param  {string} key  The binding name to store the value under
	 * @param  {mixed} value The data to be stored
	 * @return {query} Exports `this` for chaining
	 */
	function insertBinding (key, value) {
		if (typeof value === 'object') {
			// if we've got a date, convert it into a mysql ready datestamp
			if (value instanceof Date) {
				value = value.toISOString().slice(0, 19).replace('T', ' ');
			} else {
				throw new TypeError('Received unparsable object as field value.');
			}
		}

		if (key.substr(0,2) !== '{{') key = '{{' + key + '}}';

		attributes.dataBindings[key] = value;

		return this;
	}

	/**
	 * Stores the passed `data` into the data bindings collection and returns a
	 * unique string representation of that data for use in the query.
	 *
	 * Data bindings in queryize are represented by a key name surrounded by
	 * double brackets.  These values are then converted to question marks after
	 * the query is compiled, with the values appended to the data array.
	 *
	 * If a `modifier` function name is provided, the returned binding will be wrapped with that MySQL function.
	 *
	 * @memberOf query
	 * @category Data
	 * @param  {mixed} value The data to be stored
	 * @param  {string} [modifier] A MySQL function to wrap the binding in when it is inserted into SQL.
	 * @return {query} Exports `this` for chaining
	 * @example
	 *
	 * query.createBinding('name@example.com');
	 * // => "{{binding0d}}"
	 *
	 * query.createBinding('2013-06-18', 'DATE');
	 * // => "DATE({{binding4f}})"
	 *
	 */
	function createBinding (value, modifier) {
		if (value === true) return 'TRUE';
		if (value === false) return 'FALSE';
		if (value === null) return 'NULL';

		if (typeof value === 'object') {
			// if we've got a date, convert it into a mysql ready datestamp
			if (value instanceof Date) {
				value = value.toISOString().slice(0, 19).replace('T', ' ');
			} else {
				throw new TypeError('Received unparsable object as field value.');
			}
		}

		var key = '{{' + _uniqueId('binding') + '}}';

		insertBinding(key, value);

		return modifier ? [modifier, '(', key, ')'].join('') : key;
	}

	/**
	 * Marks the query as being a SELECT statement.
	 *
	 * One or more columns or an array of columns to select from may be passed
	 * in as arguments.  See `query.columns()` for more details.
	 *
	 * @memberOf query
	 * @category Action
	 * @param {string|Array<string>} [columns] All arguments received are passed to a `query.columns()` call
	 * @return {query} Exports `this` for chaining
	 * @example
	 * var q = queryize()
	 *   .select('name')
	 *   .from('users')
	 *   .where('user.id', 128)
	 *   .compile()
	 */
	function select () {
		attributes.builder = 'select';
		if (arguments.length) {
			this.columns([].slice.call(arguments));
		}
		return this;
	}

	/**
	 * Marks the query as being a DELETE statement
	 *
	 * Supports passing the target table and alias as syntatic sugar.  See `query.from()` for more details.
	 *
	 * @alias deleet
	 * @memberOf query
	 * @category Action
	 * @param  {string|Array<string>} [tablename] Table to delete from. If an array is passed, defines the tables that will be deleted from in a multi-table delete.
	 * @param  {string} [alias] An alias to use for the table
	 * @return {query} Exports `this` for chaining
	 * @example
	 * var q = queryize()
     *   .deleteFrom('users')
     *   .where({'u.id':1})
     *   .compile();
     *
     * @example
     * var q = queryize()
     *   .from('logs')
     *   .whereInRange('dts', null, '2014-06-01')
     *   .deleet()
     *   .compile()
	 */
	function deleteFrom (tablename, alias) {
		attributes.builder = 'delete';

		if (isArray(tablename)) {
			if (alias) {
				this.from(tablename.shift(), alias);
				tablename.unshift(alias);
			}
			this.columns(tablename);
		} else if (tablename) {
			this.from(tablename, alias);
		}

		return this;
	}

	/**
	 * Marks the query as being an INSERT statement
	 *
	 * @memberOf query
	 * @category Action
	 * @param {mixed} [arguments] All arguments received are passed to a `query.set()` call
	 * @return {query} Exports `this` for chaining
	 * @example
	 * queryize()
	 *   .insert({name: 'joe'})
	 *   .into('users')
	 *   .exec(mysqlConnection, function (result) {
	 *     var id = result.insertId;
	 *   })
	 */
	function insert () {
		attributes.builder = 'insert';
		if (arguments.length) {
			this.set([].slice.call(arguments));
		}
		return this;
	}

	/**
	 * Marks the query as being an UPDATE statement
	 *
	 * @memberOf query
	 * @category Action
	 * @param  {string} [tablename] Table to update
	 * @param  {string} [alias] An alias to use for the table
	 * @return {query} Exports `this` for chaining
	 * @example
	 * queryize()
	 *   .update('users')
	 *   .set('name', 'bob')
	 *   .where('id', 234)
	 *   .exec(mysqlConnection) //fire and forget
	 */
	function update (tablename, alias) {
		attributes.builder = 'update';
		if (tablename) {
			this.table(tablename, alias);
		}
		return this;
	}

	/**
	 * Defines the table that the query should be performed on.
	 * Can be called directly but is better called via the syntactically correct aliases.
	 *
	 * @memberOf query
	 * @category Sourcing
	 * @alias into
	 * @alias from
	 * @param  {string} tablename
	 * @param  {string} [alias] An alias to use for the table
	 * @return {query} Exports `this` for chaining
	 * @example
	 * queryize.update()
	 *   .table('users')
	 *   .set('name', 'bob')
	 *   .where('id', 234)
	 *   .exec(mysqlConnection) //fire and forget
	 * @example
	 * var q = queryize.select()
	 *   .from('users')
	 *   .compile()
	 * @example
	 * queryize.insert()
	 *   .into('orders')
	 *   .set(order)
	 *   .exec(mysqlConnection) //fire and forget
	 */
	function table (tablename, alias) {
		attributes.tableName = tablename;
		if (isDefined(alias)) {
			attributes.alias = alias;
		}
		return this;
	}

	/**
	 * Defines what database that the query should be performed on.
	 *
	 * This is only necessary if your connection has not defined a database
	 * to use, or the query needs to act upon a database other than the one
	 * currently in use.
	 *
	 * @memberOf query
	 * @category Sourcing
	 * @param  {string} dbname
	 * @param  {string} [tablename]
	 * @param  {string} [alias] An alias to use for the table
	 * @return {query} Exports `this` for chaining
	 */
	function database (dbname, tablename, alias) {
		attributes.database = dbname;
		if (tablename) {
			attributes.tableName = tablename;
		}
		if (alias) {
			attributes.alias = alias;
		}
		return this;
	}

	/**
	 * Defines what columns a SELECT statement should return, or what tables
	 * a DELETE statement should delete from.
	 *
	 * Accepts either an array of `columns`, or multiple `column` arguments.
	 *
	 * Column names can be in any format allowed in a MySQL statement.
	 *
	 * Calling multiple times will replace the previous columns with the new set.
	 *
	 * By default, all queries have `*` for SELECTs and nothing for DELETEs
	 *
	 * @memberOf query
	 * @category Sourcing
	 * @param {string|Array<string>} columns
	 * @param {...string} column2
	 * @return {query} Exports `this` for chaining
	 * @example
	 *
	 * var query = queryize.select()
	 *   .columns('users.*', 'passwords.hash as password_hash')
	 *   .from('users')
	 *   .join('passwords', {'users.id':'passwords.user_id'})
	 *
	 * @example
	 * query.columns(['username', 'firstname', 'lastname']);
	 *
	 */
	function columns () {
		var args = flatten([].slice.call(arguments));

		args = args.map(function (column) {
			if (typeof column === 'string') {
				return column;
			}

			if (typeof column === 'number' || column instanceof Date) {
				return createBinding(column);
			}

			if (typeof column === 'object' && isDefined(column.data)) {
				return createBinding(column.data, column.modifier);
			}

			console.log(column);
			throw new TypeError('Unknown column type');
		});

		attributes.columns = args;

		return this;
	}

	/**
	 * Controls the boolean operator used to combine multiple WHERE clauses
	 *
	 * By default, Queryize will combine all top level WHERE clauses with AND operators.
	 *
	 * @memberOf query
	 * @category Reduction
	 * @param  {string} condition "AND" or "OR"
	 * @return {query} Exports `this` for chaining
	 */
	function comparisonMethod (condition) {
		switch (condition) {
		case true:
		case 'and':
		case 'AND':
		case 'yes':
			attributes.whereBoolean = ' AND '; break;

		case false:
		case 'or':
		case 'OR':
		case 'no':
			attributes.whereBoolean = ' OR '; break;
		}
		return this;
	}



	/**
	 * Adds one or more WHERE clauses to the query.
	 *
	 * Calling multiple times will append more clauses onto the stack.
	 *
	 * Calling without any arguments will empty the stack.
	 *
	 * If an `operator` is provided, it will be used for all comparisons derived from this call.
	 *
	 * If a `modifier` function name is provided, the returned binding will be wrapped with that MySQL function.
	 *
	 * @memberOf query
	 * @category Reduction
	 *
	 * @signature query.where()
	 * @return {query} Exports `this` for chaining
	 * @example
	 *
	 * //removes all existing where clauses
	 * query.where()
	 *
	 * @signature query.where(clause)
	 * @param {string} clause A pre-written WHERE statement for direct insertion into the query
	 * @return {query} Exports `this` for chaining
	 * @example
	 *
	 * query.where('password IS NOT NULL')
	 * // WHERE password IS NOT NULL
	 *
	 * @signature query.where(clauses)
	 * @param {Array<string>} clause Multiple pre-written WHERE statements for direct insertion into the query as OR conditions unless otherwise defined.
	 * @return {query} Exports `this` for chaining
	 *
	 * @example
	 * query.where(['account.balance > 0', 'account.gratis IS TRUE'])
	 * // WHERE account.balance > 0 OR account.gratis IS TRUE
	 *
	 * @example
	 * query.where(['AND', 'client.active IS TRUE', 'client.paidthru < NOW()'])
	 * // WHERE client.active IS TRUE AND client.paidthru < NOW()
	 *
	 * @signature query.where(field, value, [operator], [modifier])
	 * @param {string|Array<string>} field The table field(s) to match against
	 * @param {string|Array<string>} value The value(s) to match with (if more than one, performs an OR comparison of each)
	 * @param {string} [operator='='] The operator to use when performing the comparison (e.g. =, !=, >, LIKE, IS NOT, etc)
	 * @param {string} [modifier] A MySQL function to wrap the binding in when it is inserted into SQL.
	 * @return {query} Exports `this` for chaining
	 * @example
	 * query.where('age', 21, '<')
	 * // WHERE age < ?
	 * // Data: [21]
	 *
	 * @example
	 * query.where('created', new Date('2014-01-01'), '>=', 'DATE')
	 * // WHERE created >= DATE(?)
	 * // Data: ['2014-01-01 00:00:00']
	 *
	 * @signature query.where(pairs, [operator], [modifier])
	 * @param {Object} pairs Collection of field/value pairs to match against
	 * @param {string} [operator='='] The operator to use when performing the comparison (e.g. =, !=, >, LIKE, IS NOT, etc)
	 * @param {string} [modifier] A MySQL function to wrap the binding in when it is inserted into SQL.
	 * @return {query} Exports `this` for chaining
	 *
	 * @example
	 * query.where({studio:'Paramount', franchise: 'Star Trek' });
	 * // WHERE studio = ? AND franchise = ?
	 * // Data: ['Paramount', 'Star Trek']
	 *
	 * @example
	 * query.where({'property.ownership': ['Own', 'Rent']})
	 * // WHERE property.ownership IN (?, ?)
	 * // Data: ['Own', 'Rent']
	 *
	 * @example
	 * query.where({'user.gender':'M, not: true, 'profile.spouse': null})
	 * // WHERE user.gender = ? AND profile.spouse != NULL
	 * // Data: ['M']
	 *
	 */
	function where (clause, value, operator, modifier) {

		if (!isDefined(clause)) {
			attributes.where = [];
			return this;
		}

		// if a value is defined, then we're performing a field > value comparison
		// and must parse that first.
		if (value !== undefined && (typeof clause === 'string' || isArray(clause))) {
			clause = _processWhereCondition(clause, value, operator, modifier);

		// if there was no value, check to see if we got an object based where definition
		} else if (typeof clause === 'object' && !isArray(clause)) {
			modifier = operator;
			operator = value;
			clause = _processWhereObject(clause, operator, modifier);
		}

		// if we've got an array at this point, then we should parse it as if it were
		// a collection of possible conditions in an OR
		if (isArray(clause)) {
			clause = flatten(clause).map(function (c) {
				switch (typeof c) {
				case 'string': return c;
				case 'object': return _processWhereObject(clause, operator, modifier);
				default:
					throw new TypeError('Where clause could not be processed. Found ' + (typeof clause) + ' instead.');
				}
			});

			var l = clause.length, subBoolean = ' OR ';
			if (l === 1) {
				clause = clause[0];
			} else if (l > 1) {
				// if the first value in the array is "AND", reverse our typical boolean.
				if (clause[0] === 'AND') {
					subBoolean = 'AND';
					clause.shift();
				}
				clause = '(' + clause.join(subBoolean) + ')';
			} else {
				clause = null;
			}
		}

		// by now the clause should be a string. if it isn't, then someone gave us an unusable clause
		if (typeof clause === 'string') {
			attributes.where.push(clause);
		} else {
			throw new TypeError('Where clause could not be processed. Found ' + (typeof clause) + ' instead.');
		}

		return this;
	}

	/**
	 * Handles basic (field, value) where clauses
	 *
	 * @private
	 * @param  {string|Array<string>} field
	 * @param  {string|Array<string>} value
	 * @param  {string} [operator]
	 * @param  {string} [modifier]
	 * @return {query} Exports `this` for chaining
	 */
	function _processWhereCondition (field, value, operator, modifier) {
		if (!operator) operator = '=';

		if (isArray(field)) {
			return field.map(function (field) {
				return _processWhereCondition(field, value, operator, modifier);
			});
		}

		// if value is an array, then we need to compare against multiple values
		if (isArray(value)) {
			// if the operator is a plain equals, we should perform an IN() instead of multiple ORs
			if (operator === '=') {

				//process the values into bindings, and join the bindings inside an IN() clause
				return field + ' IN (' + value.map(function (v) { return createBinding(v, modifier); }).join(',') + ')';
			} else if (operator === '!=') {

				//process the values into bindings, and join the bindings inside an IN() clause
				return field + ' NOT IN (' + value.map(function (v) { return createBinding(v, modifier); }).join(',') + ')';

			} else {

				// process each value individually as a single condition and join the values in an OR
				return value.map(function (value) { return _processWhereCondition(field, value, operator, modifier); });

			}
		}

		return [field, operator, createBinding(value, modifier)].join(' ');
	}

	/**
	 * Handles object based where clauses
	 *
	 * @private
	 * @param  {Object} clause
	 * @param  {string} [operator]
	 * @param  {string} [modifier]
	 * @return {query} Exports `this` for chaining
	 */
	function _processWhereObject (clause, operator, modifier) {
		if (!operator) operator = '=';

		var not = false;
		clause = Object.keys(clause).map(function (field) {
			// if the object contains a 'not' key, all subsequent keys parsed will be negations.
			if (field === 'not' && clause[field] === true) {
				not = true;
				if (operator === '=') operator = '!=';
				return undefined;
			}

			return _processWhereCondition(field, clause[field], operator, modifier);
		});

		clause = flatten(clause).filter(function (d) { return d;});

		if (clause.length === 1) {
			return clause[0];
		} else if (clause.length > 1) {
			return '(' + clause.join(' AND ') + ')';
		}

		return undefined;
	}

	/**
	 * Adds a where condition for a field between two values.
	 *
	 * @memberOf query
	 * @category Reduction
	 * @param  {string} field
	 * @param  {string|number} from
	 * @param  {string|number} to
	 * @param  {string} modifier
	 * @return {query} Exports `this` for chaining
	 * @example
	 * query.whereBetween('profile.income', 18000, 60000)
	 * // Where profile.income BETWEEN ? AND ?
	 * // Data: [18000, 60000]
	 */
	function whereBetween (field, from, to, modifier) {
		where([field, 'BETWEEN', createBinding(from, modifier), 'AND', createBinding(to, modifier)].join(' '));

		return this;
	}

	/**
	 * Shortcut for performing a LIKE comparison on a field and value
	 *
	 * @memberOf query
	 * @category Reduction
	 * @param  {string|Array<string>|Object} field
	 * @param  {string|number|Array<string|number>} value
	 * @param  {string} [modifier]
	 * @return {query} Exports `this` for chaining
	 * @example
	 * queryize.select()
	 *   .from('users')
	 *   .whereLike('email', '%gmail.com')
	 */
	function whereLike (field, value, modifier) {
		if (typeof field === 'object') {
			where(field, 'LIKE', modifier);
		} else {
			where(field, value, 'LIKE', modifier);
		}
		return this;
	}

	/**
	 * Shortcut for performing an != comparisoon on a field and value
	 *
	 * @memberOf query
	 * @category Reduction
	 * @param  {string|Array<string>|Object} field
	 * @param  {string|number|Array<string|number>} value
	 * @param  {string} [modifier]
	 * @return {query} Exports `this` for chaining
	 * @example
	 * queryize.select()
	 *   .from('users')
	 *   .whereNot('type', 'Admin')
	 */
	function whereNot (field, value, modifier) {
		if (typeof field === 'object') {
			where(field, '!=', modifier);
		} else {
			where(field, value, '!=', modifier);
		}
		return this;
	}

	/**
	 * Shortcut for performing a NOT LIKE comparison on a field and value
	 *
	 * @memberOf query
	 * @category Reduction
	 * @param  {string|Array<string>|Object} field    [description]
	 * @param  {string|number|Array<string|number>} value    [description]
	 * @param  {string} [modifier] [description]
	 * @return {query} Exports `this` for chaining
	 */
	function whereNotLike (field, value, modifier) {
		if (typeof field === 'object') {
			where(field, 'NOT LIKE', modifier);
		} else {
			where(field, value, 'NOT LIKE', modifier);
		}
		return this;
	}

	/**
	 * Creates a where condition for if a field fit within a boundry of values.
	 *
	 * Omitting/passing null to the `from` or `to` arguments will make the range boundless on that side.
	 *
	 * @memberOf query
	 * @category Reduction
	 * @param  {string|Array<string>} field
	 * @param  {string|number|Date} [from]
	 * @param  {string|number|Date} [to]
	 * @param  {string} [modifier]
	 * @return {query} Exports `this` for chaining
	 * @example
	 * query.whereInRange('profile.income', 18000, 60000)
	 * // Where profile.income BETWEEN ? AND ?
	 * // Data: [18000, 60000]
	 *
	 * @example
	 * query.whereInRange('age', 21)
	 * // WHERE age >= ?
	 * // Data: [21]
	 *
	 * @example
	 * query.whereInRange('product.cost', null, 100)
	 * // WHERE product.cost <= ?
	 * // Data: [100]
	 *
	 */
	function whereInRange (field, from, to, modifier) {
		if (isDefined(from) && isDefined(to)) {
			whereBetween(field, from, to, modifier);
		} else if (isDefined(from)) {
			where(field, from, '>=', modifier);
		} else if (isDefined(to)) {
			where(field, to, '<=', modifier);
		}
		return this;
	}

	/**
	 * Defines what columns a select statement should use to sort the results.
	 * Accepts either an array of `columns`, or multiple `column` arguments.
	 *
	 * Calling multiple times will replace the previous sort order with the new values.
	 *
	 * @memberOf query
	 * @category Selection
	 * @param {...string|Array<string>} columns Column names can be in any format allowed in a MySQL statement.
	 * @return {query} Exports `this` for chaining
	 * @example
	 * query.orderBy('category', 'DATE(date_posted) DESC');
	 */
	function orderBy (columns) {
		var args = flatten([].slice.call(arguments));

		attributes.orderBy = args;

		return this;
	}

	/**
	 * Defines what columns and conditions a select statement should group the results under.
	 *
	 * Accepts either an array of `columns`, or multiple `column` arguments.
	 *
	 * Calling multiple times will replace the previous grouping rules with the new values.
	 *
	 * @memberOf query
	 * @category Selection
	 * @param {string...|Array<string>} columns Column names can be in any format allowed in a MySQL statement.
	 * @return {query} Exports `this` for chaining
	 * @example
	 * query.groupBy('user.id', 'DATE(dts)');
	 */
	function groupBy (columns) {
		var args = flatten([].slice.call(arguments));

		attributes.groupBy = args;

		return this;
	}

	/**
	 * Defines if a SELECT statement should return distinct results only
	 *
	 * @memberOf query
	 * @category Selection
	 * @param  {boolean} enable
	 * @return {query} Exports `this` for chaining
	 */
	function distinct (enable) {
		attributes.distinct = isDefined(enable) ? true : enable;
		return this;
	}

	/**
	 * Defines the maximum results the query should return, and the starting offset of the first row within a set.
	 *
	 * @memberOf query
	 * @category Selection
	 * @param  {number} max Total results to return
	 * @param  {number} [offset] Starting offset of first row within the results
	 * @return {query} Exports `this` for chaining
	 */
	function limit (max, offset) {
		if (isDefined(max)) max = 0;
		if (isDefined(offset)) offset = 0;

		attributes.limit = max ? ['LIMIT ',Number(offset), ', ', Number(max)].join() : false;

		return this;
	}

	/**
	 * Defines what data to set the specified columns to during INSERT and UPDATE queries
	 *
	 * @memberOf query
	 * @category Insertion & Replacement
	 *
	 * @signature query.set(statement)
	 * @param {string} statement A fully written set condition
	 * @return {query} Exports `this` for chaining
	 *
	 * @signature query.set(column, value, [modifier])
	 * @param {string} column
	 * @param {string|number} value
	 * @return {query} Exports `this` for chaining
	 *
	 * @signature query.set(data, [modifier])
	 * @param {Object} data A plain object collection of column/value pairs
	 * @param {string} modifier [description]
	 * @return {query} Exports `this` for chaining
	 *
	 * @example
	 * query.set('user.lastlogin = NOW()')
	 * // SET user.lastlogin = NOW()
	 *
	 * @example
	 * query.set('address', '9 Pseudopolis Yard')
	 * // SET address = ?
	 * // Data: ['9 Pseudopolis Yard']
	 *
	 * @example
	 * query.set({firstname: 'Susan', lastname: 'Sto Helet'})
	 * // SET firstname = ?, lastname = ?
	 * // DATA: ['Susan', 'Sto Helet']
	 */
	function set (clause, value, modifier) {

		if (!isDefined(clause)) throw new Error('You must define a field to set.');

		if (typeof clause === 'object') {
			Object.keys(clause).forEach(function (field) {
				set(field, clause[field], value);
			});
			return this;
		}

		// if we received a value, create a set clause
		if (isDefined(value)) {
			if (!isValidPrimative(value)) {
				throw new TypeError('Unknown data type in set clause');
			}
			clause = [clause, '=', createBinding(value, modifier)].join(' ');
		}

		attributes.set.push(clause);

		return this;
	}

	/** RegEx used to detect if a join string already has a JOIN directive **/
	var joinTest = /^(?:.*)JOIN /i;

	/**
	 * Adds a table join to the query.
	 *
	 * Queryize will append any missing JOIN command at the beginning of a statement
	 *
	 * @memberOf query
	 * @category Inclusion
	 *
	 * @signature query.join(statement)
	 * @param  {string} statement  Fully formed join statement
	 * @return {query} Exports `this` for chaining
	 * @example
	 * query.join('orders o ON o.client_id = c.id')
	 * query.join('JOIN orders o ON o.client_id = c.id')
	 * query.join('LEFT JOIN orders o ON o.client_id = c.id')
	 *
	 * @signature query.join(tablename, options)
	 * @param {string} tablename
	 * @param {Object} options Plain object containing options for the join
	 * @return {query} Exports `this` for chaining
	 * @example
	 * query.join('orders', {alias: 'o', on: 'o.client_id = c.id'})
	 * query.join('orders', {alias: 'o', on: {'o.client_id':'c.id'})
	 * // JOIN orders o ON o.client_id = c.id
	 *
	 * @example
	 * query.join('orders', {on: {'o.client_id':'c.id', not:true, o.status: [4,5]})
	 * // JOIN orders ON o.client_id = c.id AND o.status NOT IN (?,?)
	 * // Data: [4, 5]
	 *
	 * @example
	 * query.join('orders', {on: {'o.client_id':'c.id', not:true, o.condition: {data: 'A'}})
	 * // JOIN orders ON o.client_id = c.id AND o.status != ?
	 * // Data: ['A']
	 *
	 * @example
	 * query.join('orders', {alias: 'o', type: 'LEFT', on: 'o.client_id = c.id'})
	 * // LEFT JOIN orders o ON o.client_id = c.id
	 *
	 * @signature query.join(options)
	 * @param {Object} options Plain object containing options for the join
	 * @return {query} Exports `this` for chaining
	 *
	 * @example
	 * query.join({table: 'orders', alias: 'o', on: {'o.client_id':'c.id'})
	 *
	 * @example
	 * query.join({table: 'orders', alias: 'o', type: 'LEFT' on: {'o.client_id':'c.id'})
	 * // LEFT JOIN orders o ON o.client_id = c.id
	 * @example
	 * query.join('orders', {on: {'o.client_id':'c.id', not:true, o.condition: {data: 'A'}})
	 * // JOIN orders ON o.client_id = c.id AND o.status != ?
	 * // Data: ['A']

	 *
	 */
	function join (clause, options) {
		if (!isDefined(clause)) throw new Error('You must define a table to join against.');

		if (typeof clause === 'object') {

			if (isArray(clause)) throw new TypeError('Join clauses can only be strings or object definitions');
			if (!clause.table) throw new Error('You must define a table to join against');

		} else if (typeof options === 'object') {

			options = Object.create(options);
			options.table = clause;
			clause = options;

		} else if (typeof clause === 'string' && clause.search(joinTest) < 0) {

			clause = 'JOIN ' + clause;

		}

		if (typeof clause === 'object') {

			var stack = [];

			if (clause.type) stack.push(clause.type);
			stack.push('JOIN');
			stack.push(clause.table);
			if (clause.alias) stack.push(clause.alias);

			if (clause.using) {
				stack.push( 'USING (' + (isArray(clause.using) ? clause.using.join(', ') : clause.using) + ')' );

			} else if (clause.on) {
				stack.push( 'ON (' + _processJoinOns(clause.on, clause.onBoolean || 'AND') + ')' );

			}

			clause = stack.join(' ');
		}

		attributes.joins.push(clause);

		return this;
	}

	/**
	 * Shortcut for creating an INNER JOIN
	 *
	 * See `query.join()` for argument details
	 *
	 * @name innerJoin
	 * @memberOf query
	 * @category Inclusion
	 * @return {query} Exports `this` for chaining
	 */
	function innerJoin() {
		// See _makeJoiner Function
	}

	/**
	 * Shortcut for creating a LEFT JOIN
	 *
	 * See `query.join()` for argument details
	 *
	 * @name leftJoin
	 * @memberOf query
	 * @category Inclusion
	 * @return {query} Exports `this` for chaining
	 */
	function leftJoin() {
		// See _makeJoiner Function
	}

	/**
	 * Shortcut for creating a RIGHT JOIN
	 *
	 * See `query.join()` for argument details
	 *
	 * @name rightJoin
	 * @memberOf query
	 * @category Inclusion
	 * @return {query} Exports `this` for chaining
	 */
	function rightJoin() {
		// See _makeJoiner Function
	}

	/**
	 * Generates the closures for innerJoin, leftJoin and rightJoin
	 * @private
	 * @param  {string} type Join type
	 * @return {function}
	 */
	function _makeJoiner(type) {
		return function (clause, options) {

			if (typeof clause === 'object') {

				if (isArray(clause)) throw new TypeError('Join clauses can only be strings or object definitions');
				if (!clause.table) throw new Error('You must define a table to join against');

			} else if (typeof options === 'object') {

				options = Object.create(options);
				options.table = clause;
				clause = options;

			}

			if (typeof clause === 'object') {
				clause.type = type;
			} else {
				clause = clause.search(joinTest) > -1 ? clause.replace(joinTest, type+' JOIN ') : type+' JOIN ' + clause;
			}

			join(clause);

			return this;
		};
	}

	/**
	 * Processes join conditions into a standardized format that's uniformly parsable
	 * @private
	 * @return {Array}
	 */
	function _processJoinOns(ons, onBoolean) {

		if (typeof ons === 'string') {
			return ons;
		}

		if (isArray(ons)) {
			ons = ons.map(function (d) { return _processJoinOns(d); });
		}

		if (typeof ons === 'object' && !isArray(ons)) {
			var not = false;
			ons = Object.keys(ons).map(function (field) {
				var value = ons[field];

				// if the object contains a 'not' key, all subsequent keys parsed will be negations.
				if (field === 'not' && value === true) {
					not = true;
					return undefined;
				}

				// if value is an array, perform an IN() on the values
				if (isArray(value)) {
					value = value.map(function (d) {return createBinding(d); });
					return [field, not ? 'NOT IN' : 'IN', '(', value.join(', '), ')'].join(' ');

				// if value is a string or a number, process as if a normal pairing of columns
				} else if (typeof value === 'string') {
					return [field, not ? '!=' : '=', value].join(' ');

				// finally, process the value as if it were an actual value for binding
				} else if (isValidPrimative(value)) {
					return [field, not ? '!=' : '=', createBinding(value)].join(' ');

				// if value is an object, verify if it's a data object, and if so create a binding for the value
				} else if (typeof value === 'object' && value.data !== undefined) {
					return [field, not ? '!=' : '=', createBinding(value.data, value.modifier)].join(' ');
				}

				// we don't know how to handle the value
				throw new Error('Encountered unexpected value while parsing a JOIN ON condition for ' + field);
			});
		}

		//remove any undefined or empty string values
		ons = ons.filter(function (d) { return d; });

		return ons.join(' '+onBoolean+' ');
	}

	/**
	 * Constructs the table name to use in queries, with backticks
	 * @private
	 * @return {string}
	 */
	function _buildTableName () {
		var q = [];
		
		if (attributes.database) {
			q.push('`' + attributes.database + '`.');
		}
		
		q.push('`' + attributes.tableName + '`');
		
		if (attributes.alias) {
			q.push(' ' + attributes.alias);
		}

		return q.join('');
	}

	/**
	 * Query Builder Functions used by query.compile
	 * @type {Object}
	 */
	var builders = {
		'select': function buildSelect() {
			var columns = attributes.columns.join(', ');
			if (attributes.distinct) columns = 'DISTINCT ' + columns;

			var q = ['SELECT', columns, 'FROM', _buildTableName()];

			q = q.concat(attributes.joins);

			if (attributes.where.length) {
				q.push('WHERE');
				q.push(attributes.where.join(attributes.whereBoolean));
			}

			if (attributes.groupBy.length) {
				q.push('GROUP BY');
				q.push(attributes.groupBy.join(', '));
			}

			if (attributes.orderBy.length) {
				q.push('ORDER BY');
				q.push(attributes.orderBy.join(', '));
			}

			if (attributes.limit) {
				q.push(attributes.limit);
			}

			q = q.join(' ');

			return q;
		},

		'update': function buildUpdate() {
			var q = ['UPDATE', _buildTableName()];

			if (!attributes.set.length) {
				throw new Error('No values to insert have been defined');
			}

			q = q.concat(attributes.joins);

			q.push('SET');
			q.push(attributes.set.join(', '));

			if (!attributes.where.length) {
				throw new Error('No where clauses have been defined for the delete query.');
			}

			q.push('WHERE');
			q.push(attributes.where.join(attributes.whereBoolean));

			q = q.join(' ');

			return q;
		},

		'insert': function buildInsert() {
			var q = ['INSERT INTO', _buildTableName()];

			if (!attributes.set.length) {
				throw new Error('No values to insert have been defined');
			}

			q.push('SET');
			q.push(attributes.set.join(', '));

			q = q.join(' ');

			return q;
		},

		'delete': function buildDelete() {
			var q = ['DELETE'];

			if (attributes.columns.length) {
				var columns = attributes.columns.join(', ');
				if (columns && columns !== '*') q.push(columns);
			}

			q.push('FROM');
			q.push(_buildTableName());

			q = q.concat(attributes.joins);

			if (!attributes.where.length) {
				throw new Error('No where clauses have been defined for the delete query.');
			}
			
			q.push('WHERE');
			q.push(attributes.where.join(attributes.whereBoolean));

			q = q.join(' ');

			return q;
		}

	};

	/**
	 * Compiles the final MySQL query
	 * @memberOf query
	 * @category Evaluation
	 * @return {Object} {query: String, data: Array<String,Number>}
	 */
	function compile () {
		if (!attributes.builder || !builders[attributes.builder]) throw new Error('Query operation undefined, must identify if performing a select/update/insert/delete query.');
		if (!attributes.tableName) throw new Error('No table name has been defined');

		var queryString = builders[attributes.builder]();

		return _convertNamedParameters(queryString);
	}

	/**
	 * node-mysql query callback
	 *
	 * @callback runCallback
	 * @param {Object|null} error
	 * @param {Array} results
	 */
	
	/**
	 * @typedef {EventEmitter} nodeMysqlQuery
	 * @property {Function} on Bind to an event
	 * @property {Function} stream Create a streams2 object for the request
	 */

	/**
	 * Compiles the MySQL query and runs it using the provided connection or connection pool.  from node-mysql or node-mysql2.
	 * If the connection provided is a node-mysql2 connection, then the query will be executed as a prepared statement (connection.execute).
	 * Returns the mysql query object, extended with .then() and .catch() methods for use as a promise.
	 *
	 * @memberOf query
	 * @category Evaluation
	 * @alias run
	 * @param  {Object}   connection node-mysql(2) connection(Pool)
	 * @param  {Object}   [options]  Options object to be passed to `connection.query` with the query string and data mixed in.
	 * @param  {Function} [callback] Callback function to be invoked when the query completes.
	 * @return {Thenable<MysqlQuery>} Promise extended node-mysql query emitter object
	 */
	function exec (connection, options, callback) {
		var func;
		if (typeof connection.execute === 'function') func = 'execute';
		else if (typeof connection.query === 'function') func = 'query';
		else throw new TypeError('Connection object is not a mysql or mysql2 connection or pool.');

		var q = this.compile();

		if (attributes.debugEnabled) console.log(q);

		// if the second argument is a callback, remap the arguments
		if (!callback && typeof options === 'function') {
			callback = options;
			options = null;

		// if the second argument is an options object, wrap it and apply our query & data to it.
		} else if (typeof options === 'object') {
			options = Object.create(options);
			options.sql = q.query;
			options.values = q.data;
		}

		// generate a proxmis with the callback (if provided), which will be used to extend the query return
		var pcb = proxmis(callback);

		var emitter;
		if (options) {
			emitter = connection[func](options, pcb);
		} else {
			emitter = connection[func](q.query, q.data, pcb);
		}

		emitter.then = pcb.then;
		emitter.catch = pcb.catch;

		return emitter;
	}


/************************************************************************************************************************/


	/**
	 * @typedef query
	 * @type {Object}
	 */
	var query = {

		_isQueryizeObject: true,

		/**
		 * If passed a truthy value, `query.exec()` will output the compiled query to the console.
		 *
		 * @memberOf query
		 * @param  {boolean} enable
		 * @return {query} Exports `this` for chaining
		 */
		debug: function (enable) {
			if (isDefined(enable)) enable = true;

			attributes.debugEnabled = enable;

			return this;
		},

		/**
		 * Controls if compiled queries should have values replaced with placeholders for
		 * data binding, or simply have escaped values directly in the query.
		 *
		 * By default, queryize will use data binding.  Passing false to this function will disable this behavior.
		 *
		 * You can also set `queryize.useBoundParameters = false` to disable databinding for all queries
		 *
		 * @memberOf query
		 * @param  {boolean} enable
		 * @return {query} Exports `this` for chaining
		 */
		useBoundParameters: function (on) {
			useBoundParameters = isDefined(on) ? on : true;
			return this;
		},

		/**
		 * Copies the attribute data for the query object and returns the copy
		 * @private
		 * @name export
		 * @memberOf query
		 * @return {Object}
		 */
		export: function () {
			return clone(attributes, true);
		},
		createBinding: createBinding,
		insertBinding: insertBinding,
		select: select,
		deleet: deleteFrom,
		deleteFrom: deleteFrom,
		insert: insert,
		update: update,
		table: table,
		into: table,
		from: table,
		database: database,
		intoDatabase: database,
		fromDatabase: database,
		columns: columns,
		comparisonMethod: comparisonMethod,
		where: where,
		whereLike: whereLike,
		whereNot: whereNot,
		whereNotLike: whereNotLike,
		whereInRange: whereInRange,
		whereBetween: whereBetween,
		set: set,
		join: join,
		innerJoin: _makeJoiner('INNER'),
		leftJoin: _makeJoiner('LEFT'),
		rightJoin: _makeJoiner('RIGHT'),
		orderBy: orderBy,
		groupBy: groupBy,
		distinct: distinct,
		limit: limit,
		compile: compile,
		run: exec,
		exec: exec

	};

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

/**
 * creates a string that is unique to this runtime session
 * @private
 * @param  {string} [prefix]
 * @return {string}
 */
function _uniqueId(prefix) {
	var id = (++idCounter).toString(16);
	return prefix ? prefix + id : id;
}

/**
 * Shorthand for Array.isArray
 * @param {mixed} input
 * @return {boolean}
 * @private
 */
var isArray = Array.isArray;

/**
 * Test if a value is defined and not null
 * @param  {mixed}  value
 * @return {Boolean}
 * @private
 */
function isDefined(value) {
	return value !== undefined && value !== null;
}

/**
 * Tests if a value is a valid type for storing in mysql
 * @param  {mixed}  value
 * @return {Boolean}
 * @private
 */
function isValidPrimative(value) {
	return typeof value === 'string' ||
		typeof value === 'boolean' ||
		typeof value === 'number' ||
		value === null ||
		(value instanceof Date);
}

/**
 * Flattens a nested array into a single level array
 * @private
 * @param  {Array} input The top level array to flatten
 * @param  {boolean} [includingObjects=false] If an object is encountered and this argument is truthy, the object will also be flattened by its property values.
 * @return {Array}
 */
function flatten(input, includingObjects) {
	var result = [];

	function descend(level) {
		if (isArray(level)) {
			level.forEach(descend);
		} else if (typeof level === 'object' && includingObjects) {
			Object.keys(level).forEach(function (key) {
				descend(level[key]);
			});
		} else {
			result.push(level);
		}
	}

	descend(input);

	return result;
}

