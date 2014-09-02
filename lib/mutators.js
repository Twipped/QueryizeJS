var clone = require('lodash.clone');
var proxmis = require('proxmis');

/**
 * @typedef query
 * @type {Object}
 */
var query = module.exports = exports = {};

/**
 * If passed a truthy value, `query.exec()` will output the compiled query to the console.
 *
 * @memberOf query
 * @param  {boolean} enable
 * @return {query} Exports `this` for chaining
 */
query.debug = function debug (enable) {
	if (isDefined(enable)) enable = true;

	this._attributes.debugEnabled = enable;

	return this;
};

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
query.insertBinding = function insertBinding (key, value) {
	if (typeof value === 'object') {
		// if we've got a date, convert it into a mysql ready datestamp
		if (value instanceof Date) {
			value = value.toISOString().slice(0, 19).replace('T', ' ');
		} else {
			throw new TypeError('Received unparsable object as field value.');
		}
	}

	if (key.substr(0,2) !== '{{') key = '{{' + key + '}}';

	this._attributes.dataBindings[key] = value;

	return this;
};

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
query.createBinding = function createBinding (value, modifier) {
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

	this.insertBinding(key, value);

	return modifier ? [modifier, '(', key, ')'].join('') : key;
};

/**
 * Processes the freshly compiled query string, replacing all data bindings with placeholders and constructs the data array
 * If useBoundParameters is turned off, it replaces the placeholders with their escaped values.
 * @private
 * @memberOf query
 * @param  {string} queryString The query string to be processed
 * @return {compiledQuery} The processed query
 */
query._convertNamedParameters = function _convertNamedParameters (queryString) {
	var data = [], self = this;

	if (this._attributes.useBoundParameters) {
		queryString = queryString.replace(/({{\w*}})/g, function (match, name) {
			if (self._attributes.dataBindings[name] === undefined) throw new Error('The data binding ' + name + ' could not be found.');

			data.push(self._attributes.dataBindings[name]);

			return '?';
		});
	} else {
		queryString = queryString.replace(/({{\w*}})/g, function (match, name) {
			if (self._attributes.dataBindings[name] === undefined) throw new Error('The data binding ' + name + ' could not be found.');

			return _escapeValue(self._attributes.dataBindings[name]);
		});
	}

	/**
	 * @typedef compiledQuery
	 * @type {Object}
	 * @property {string} query The query string ready for sending to mysql
	 * @property {Array<string|number>} data All bound data values for the query, in order of the corrusponding placeholder questionmark in the query string.
	 */
	return {
		query: queryString,
		data: data
	};
};

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
query.select = function select () {
	this._attributes.builder = 'select';
	if (arguments.length) {
		this.columns(arrayFromArguments.apply(null, arguments));
	}
	return this;
};

/**
 * Marks the query as being a DELETE statement
 *
 * Supports passing the target table and alias as syntatic sugar.  See `query.from()` for more details.
 *
 * @name delete
 * @alias deleteFrom
 * @memberOf query
 * @category Action
 * @param  {string|Array<string>} [tablename] Table to delete from. If an array is passed, defines the tables that will be deleted from in a multi-table delete.
 * @param  {string} [alias] An alias to use for the table
 * @return {query} Exports `this` for chaining
 * @example
 * var q = queryize()
 *   .delete('users')
 *   .where({'u.id':1})
 *   .compile();
 *
 * @example
 * var q = queryize()
 *   .from('logs')
 *   .whereInRange('dts', null, '2014-06-01')
 *   .deleteFrom()
 *   .compile()
 */
exports.delete = query.deleteFrom = function deleteFrom (tablename, alias) {
	this._attributes.builder = 'delete';

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
};

/**
 * Marks the query as being an INSERT statement
 *
 * @memberOf query
 * @category Action
 * @param {mixed} [values] All arguments received are passed to a `query.set()` call
 * @return {query} Exports `this` for chaining
 * @example
 * queryize()
 *   .insert({name: 'joe'})
 *   .into('users')
 *   .exec(mysqlConnection, function (result) {
 *     var id = result.insertId;
 *   })
 */
query.insert = function insert () {
	this._attributes.builder = 'insert';
	if (arguments.length) {
		this.set(arrayFromArguments.apply(null, arguments));
	}
	return this;
};

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
query.update = function update (tablename, alias) {
	this._attributes.builder = 'update';
	if (tablename) {
		this.table(tablename, alias);
	}
	return this;
};

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
query.table = exports.into = exports.from = function table (tablename, alias) {
	this._attributes.tableName = tablename;
	if (isDefined(alias)) {
		this._attributes.alias = alias;
	}
	return this;
};

/**
 * Defines what database that the query should be performed on.
 *
 * This is only necessary if your connection has not defined a database
 * to use, or the query needs to act upon a database other than the one
 * currently in use.
 *
 * @memberOf query
 * @alias intoDatabase
 * @alias fromDatabase
 * @category Sourcing
 * @param  {string} dbname
 * @param  {string} [tablename]
 * @param  {string} [alias] An alias to use for the table
 * @return {query} Exports `this` for chaining
 */
query.database = exports.intoDatabase = exports.fromDatabase = function database (dbname, tablename, alias) {
	this._attributes.database = dbname;
	if (tablename) {
		this._attributes.tableName = tablename;
	}
	if (alias) {
		this._attributes.alias = alias;
	}
	return this;
};

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
query.columns = function columns () {
	var args = flatten(arrayFromArguments.apply(null, arguments));
	var self = this;

	args = args.map(function (column) {
		if (typeof column === 'string') {
			return column;
		}

		if (typeof column === 'number' || column instanceof Date) {
			return self.createBinding(column);
		}

		if (typeof column === 'object' && isDefined(column.data)) {
			return self.createBinding(column.data, column.modifier);
		}

		console.log(column);
		throw new TypeError('Unknown column type');
	});

	this._attributes.columns = args;

	return this;
};

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
query.comparisonMethod = function comparisonMethod (condition) {
	switch (condition) {
	case true:
	case 'and':
	case 'AND':
	case 'yes':
		this._attributes.whereBoolean = ' AND '; break;

	case false:
	case 'or':
	case 'OR':
	case 'no':
		this._attributes.whereBoolean = ' OR '; break;
	}
	return this;
};



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
query.where = function where (clause, value, operator, modifier) {

	if (!isDefined(clause)) {
		this._attributes.where = [];
		return this;
	}

	var self = this;

	// if a value is defined, then we're performing a field > value comparison
	// and must parse that first.
	if (value !== undefined && (typeof clause === 'string' || isArray(clause))) {
		clause = this._processWhereCondition(clause, value, operator, modifier);

	// if there was no value, check to see if we got an object based where definition
	} else if (typeof clause === 'object' && !isArray(clause)) {
		modifier = operator;
		operator = value;
		clause = this._processWhereObject(clause, operator, modifier);
	}

	// if we've got an array at this point, then we should parse it as if it were
	// a collection of possible conditions in an OR
	if (isArray(clause)) {
		clause = flatten(clause).map(function (c) {
			switch (typeof c) {
			case 'string': return c;
			case 'object': return self._processWhereObject(clause, operator, modifier);
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
		this._attributes.where.push(clause);
	} else {
		throw new TypeError('Where clause could not be processed. Found ' + (typeof clause) + ' instead.');
	}

	return this;
};

/**
 * Handles basic (field, value) where clauses
 *
 * @private
 * @memberOf query
 * @param  {string|Array<string>} field
 * @param  {string|Array<string>} value
 * @param  {string} [operator]
 * @param  {string} [modifier]
 * @return {query} Exports `this` for chaining
 */
query._processWhereCondition = function _processWhereCondition (field, value, operator, modifier) {
	var self = this;
	if (!operator) operator = '=';

	if (isArray(field)) {
		return field.map(function (field) {
			return self._processWhereCondition(field, value, operator, modifier);
		});
	}

	// if value is an array, then we need to compare against multiple values
	if (isArray(value)) {
		// if the operator is a plain equals, we should perform an IN() instead of multiple ORs
		if (operator === '=') {

			//process the values into bindings, and join the bindings inside an IN() clause
			return field + ' IN (' + value.map(function (v) { return self.createBinding(v, modifier); }).join(',') + ')';
		} else if (operator === '!=') {

			//process the values into bindings, and join the bindings inside an IN() clause
			return field + ' NOT IN (' + value.map(function (v) { return self.createBinding(v, modifier); }).join(',') + ')';

		} else {

			// process each value individually as a single condition and join the values in an OR
			return value.map(function (value) { return self._processWhereCondition(field, value, operator, modifier); });

		}
	}

	return [field, operator, self.createBinding(value, modifier)].join(' ');
};

/**
 * Handles object based where clauses
 *
 * @private
 * @memberOf query
 * @param  {Object} clause
 * @param  {string} [operator]
 * @param  {string} [modifier]
 * @return {query} Exports `this` for chaining
 */
query._processWhereObject = function _processWhereObject (clause, operator, modifier) {
	if (!operator) operator = '=';

	var not = false, self = this;
	clause = Object.keys(clause).map(function (field) {
		// if the object contains a 'not' key, all subsequent keys parsed will be negations.
		if (field === 'not' && clause[field] === true) {
			not = true;
			if (operator === '=') operator = '!=';
			return undefined;
		}

		return self._processWhereCondition(field, clause[field], operator, modifier);
	});

	clause = flatten(clause).filter(function (d) { return d;});

	if (clause.length === 1) {
		return clause[0];
	} else if (clause.length > 1) {
		return '(' + clause.join(' AND ') + ')';
	}

	return undefined;
};

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
query.whereBetween = function whereBetween (field, from, to, modifier) {
	this.where([field, 'BETWEEN', this.createBinding(from, modifier), 'AND', this.createBinding(to, modifier)].join(' '));

	return this;
};

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
query.whereLike = function whereLike (field, value, modifier) {
	if (typeof field === 'object') {
		this.where(field, 'LIKE', modifier);
	} else {
		this.where(field, value, 'LIKE', modifier);
	}
	return this;
};

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
query.whereNot = function whereNot (field, value, modifier) {
	if (typeof field === 'object') {
		this.where(field, '!=', modifier);
	} else {
		this.where(field, value, '!=', modifier);
	}
	return this;
};

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
query.whereNotLike = function whereNotLike (field, value, modifier) {
	if (typeof field === 'object') {
		this.where(field, 'NOT LIKE', modifier);
	} else {
		this.where(field, value, 'NOT LIKE', modifier);
	}
	return this;
};

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
query.whereInRange = function whereInRange (field, from, to, modifier) {
	if (isDefined(from) && isDefined(to)) {
		this.whereBetween(field, from, to, modifier);
	} else if (isDefined(from)) {
		this.where(field, from, '>=', modifier);
	} else if (isDefined(to)) {
		this.where(field, to, '<=', modifier);
	}
	return this;
};

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
query.orderBy = function orderBy () {
	var args = flatten(arrayFromArguments.apply(null, arguments));

	this._attributes.orderBy = args;

	return this;
};

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
query.groupBy = function groupBy () {
	var args = flatten(arrayFromArguments.apply(null, arguments));

	this._attributes.groupBy = args;

	return this;
};

/**
 * Defines if a SELECT statement should return distinct results only
 *
 * @memberOf query
 * @category Selection
 * @param  {boolean} enable
 * @return {query} Exports `this` for chaining
 */
query.distinct = function distinct (enable) {
	this._attributes.distinct = isDefined(enable) ? true : enable;
	return this;
};

/**
 * Defines the maximum results the query should return, and the starting offset of the first row within a set.
 *
 * @memberOf query
 * @category Selection
 * @param  {number} max Total results to return
 * @param  {number} [offset] Starting offset of first row within the results
 * @return {query} Exports `this` for chaining
 */
query.limit = function limit (max, offset) {
	if (!isDefined(max)) max = 0;
	if (!isDefined(offset)) offset = 0;

	if (max) {
		if (offset) {
			this._attributes.limit = 'LIMIT ' + Number(offset) + ', ' + Number(max);
		} else {
			this._attributes.limit = 'LIMIT ' + Number(max);
		}
	} else {
		this._attributes.limit = false;
	}

	return this;
};

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
query.set = function set (clause, value, modifier) {
	var self = this;

	if (!isDefined(clause)) throw new Error('You must define a field to set.');

	if (typeof clause === 'object') {
		Object.keys(clause).forEach(function (field) {
			self.set(field, clause[field], value);
		});
		return this;
	}

	// if we received a value, create a set clause
	if (isDefined(value)) {
		if (!isValidPrimative(value)) {
			throw new TypeError('Unknown data type in set clause');
		}
		clause = [clause, '=', this.createBinding(value, modifier)].join(' ');
	}

	this._attributes.set.push(clause);

	return this;
};

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
query.join = function join (clause, options) {
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
			stack.push( 'ON (' + this._processJoinOns(clause.on, clause.onBoolean || 'AND') + ')' );

		}

		clause = stack.join(' ');
	}

	this._attributes.joins.push(clause);

	return this;
};

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

		this.join(clause);

		return this;
	};
}

/**
 * Shortcut for creating an INNER JOIN
 *
 * See `query.join()` for argument details
 *
 * @name innerJoin
 * @memberOf query
 * @category Inclusion
 * @function
 * @return {query} Exports `this` for chaining
 */
query.innerJoin = _makeJoiner('INNER');

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
query.leftJoin = _makeJoiner('LEFT');

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
query.rightJoin = _makeJoiner('RIGHT');

/**
 * Processes join conditions into a standardized format that's uniformly parsable
 * @private
 * @memberOf query
 * @return {Array}
 */
query._processJoinOns = function _processJoinOns(ons, onBoolean) {

	if (typeof ons === 'string') {
		return ons;
	}

	var self = this;

	if (isArray(ons)) {
		ons = ons.map(function (d) { return self._processJoinOns(d); });
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
				value = value.map(function (d) {return self.createBinding(d); });
				return [field, not ? 'NOT IN' : 'IN', '(', value.join(', '), ')'].join(' ');

			// if value is a string or a number, process as if a normal pairing of columns
			} else if (typeof value === 'string') {
				return [field, not ? '!=' : '=', value].join(' ');

			// finally, process the value as if it were an actual value for binding
			} else if (isValidPrimative(value)) {
				return [field, not ? '!=' : '=', self.createBinding(value)].join(' ');

			// if value is an object, verify if it's a data object, and if so create a binding for the value
			} else if (typeof value === 'object' && value.data !== undefined) {
				return [field, not ? '!=' : '=', self.createBinding(value.data, value.modifier)].join(' ');
			}

			// we don't know how to handle the value
			throw new Error('Encountered unexpected value while parsing a JOIN ON condition for ' + field);
		});
	}

	//remove any undefined or empty string values
	ons = ons.filter(function (d) { return d; });

	return ons.join(' ' + onBoolean + ' ');
};

/**
 * Constructs the table name to use in queries, with backticks
 * @private
 * @memberOf query
 * @return {string}
 */
query._buildTableName = function _buildTableName () {
	var q = [];

	if (this._attributes.database) {
		q.push('`' + this._attributes.database + '`.');
	}

	q.push('`' + this._attributes.tableName + '`');

	if (this._attributes.alias) {
		q.push(' ' + this._attributes.alias);
	}

	return q.join('');
};

/**
 * Query Builder Functions used by query.compile
 * @type {Object}
 */
var builders = exports._builders = {
	'select': function buildSelect () {
		var columns = this._attributes.columns.join(', ');
		if (this._attributes.distinct) columns = 'DISTINCT ' + columns;

		var q = ['SELECT', columns, 'FROM', this._buildTableName()];

		q = q.concat(this._attributes.joins);

		if (this._attributes.where.length) {
			q.push('WHERE');
			q.push(this._attributes.where.join(this._attributes.whereBoolean));
		}

		if (this._attributes.groupBy.length) {
			q.push('GROUP BY');
			q.push(this._attributes.groupBy.join(', '));
		}

		if (this._attributes.orderBy.length) {
			q.push('ORDER BY');
			q.push(this._attributes.orderBy.join(', '));
		}

		if (this._attributes.limit) {
			q.push(this._attributes.limit);
		}

		q = q.join(' ');

		return q;
	},

	'update': function buildUpdate () {
		var q = ['UPDATE', this._buildTableName()];

		if (!this._attributes.set.length) {
			throw new Error('No values to insert have been defined');
		}

		q = q.concat(this._attributes.joins);

		q.push('SET');
		q.push(this._attributes.set.join(', '));

		if (!this._attributes.where.length) {
			throw new Error('No where clauses have been defined for the delete query.');
		}

		q.push('WHERE');
		q.push(this._attributes.where.join(this._attributes.whereBoolean));

		q = q.join(' ');

		return q;
	},

	'insert': function buildInsert () {
		var q = ['INSERT INTO', this._buildTableName()];

		if (!this._attributes.set.length) {
			throw new Error('No values to insert have been defined');
		}

		q.push('SET');
		q.push(this._attributes.set.join(', '));

		q = q.join(' ');

		return q;
	},

	'delete': function buildDelete () {
		var q = ['DELETE'];

		if (this._attributes.columns.length) {
			var columns = this._attributes.columns.join(', ');
			if (columns && columns !== '*') q.push(columns);
		}

		q.push('FROM');
		q.push(this._buildTableName());

		q = q.concat(this._attributes.joins);

		if (!this._attributes.where.length) {
			throw new Error('No where clauses have been defined for the delete query.');
		}
		
		q.push('WHERE');
		q.push(this._attributes.where.join(this._attributes.whereBoolean));

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
query.compile = function compile () {
	if (!this._attributes.builder || !builders[this._attributes.builder]) throw new Error('Query operation undefined, must identify if performing a select/update/insert/delete query.');
	if (!this._attributes.tableName) throw new Error('No table name has been defined');

	var queryString = builders[this._attributes.builder].call(this);

	return this._convertNamedParameters(queryString);
};

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
 *
 * @memberOf query
 * @category Evaluation
 * @alias run
 * @param  {Object}   connection node-mysql(2) connection(Pool)
 * @param  {Object}   [options]  Options object to be passed to `connection.query` with the query string and data mixed in.
 * @param  {Function} [callback] Callback function to be invoked when the query completes.
 */
query.exec = exports.run = function exec (connection, options, callback) {
	var func;
	if (typeof connection.execute === 'function') func = 'execute';
	else if (typeof connection.query === 'function') func = 'query';
	else throw new TypeError('Connection object is not a mysql or mysql2 connection or pool.');

	var q = this.compile();

	if (this._attributes.debugEnabled) console.log(q);

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
};

/**
 * Copies the attribute data for the query object and returns the copy
 * @private
 * @name export
 * @memberOf query
 * @return {Object}
 */
query.export = function exportAttributes () {
	return clone(this._attributes, true);
};

/**
 * Generates a duplicate of the current query
 * @memberOf query
 * @return {query}
 * @example
 * var findCompleted = queryize()
 *   .from('orders')
 *   .where('status', 'completed')
 *   .select();
 *
 * var archiveCompleted = a.clone()
 *   .update()
 *   .set('status', 'archived');
 *
 * findCompleted.exec(connection, function (results) {
 *   // do something with the results and then...
 *   archiveCompleted.exec(connection);
 * });
 */
query.clone = function clone () {
	return this._constructor(this);
};

/**
 * Causes queryize to insert escaped data directly into the query instead of using data bound placeholders.
 * This is not recommended and should only be used for debugging purposes.
 *
 * You can also set `queryize.useBoundParameters = false` to disable databinding for all queries
 *
 * @memberOf query
 * @category Data
 * @param  {boolean} enable
 * @return {query} Exports `this` for chaining
 */
query.disableBoundParameters = function disableBoundParameters (bool) {
	this._attributes.useBoundParameters = isDefined(bool) ? !bool : false;
	return this;
};

/**
 * @memberOf query
 * @deprecated Use disableBoundParameters instead.
 * @category Data
 * @param  {Boolean} bool
 * @return {query} Exports `this` for chaining
 */
query.useBoundParameters = function (bool) {
	this.disableBoundParameters(isDefined(bool) ? !bool : true);
	return this;
};

/* UTILITY FUNCTIONS
 **********************************************************************************************************************************************************/

/**
 * Runtime session incrementer for _uniqueId
 * @type {Number}
 */
var idCounter = 0;

/**
* creates a string that is unique to this runtime session
* @private
* @param  {string} [prefix]
* @return {string}
*/
function _uniqueId (prefix) {
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
function isDefined (value) {
	return value !== undefined && value !== null;
}

/**
* Tests if a value is a valid type for storing in mysql
* @param  {mixed}  value
* @return {Boolean}
* @private
*/
function isValidPrimative (value) {
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
function flatten (input, includingObjects) {
	var result = [];

	function descend (level) {
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

/**
* Escapes a value for use in a MySQL query without SQL injection
* @private
* @param  {*} value The value to be escaped
* @return {string|number} The escaped value ready to be used in a query.
*/
function _escapeValue (value) {
	if (value === undefined || value === null) {
		return 'NULL';
	}

	switch (typeof value) {
		case 'boolean': return (value) ? 'true' : 'false';
		case 'number': return value + '';
	}

	if (value instanceof Date) {
		value = value.toISOString().slice(0, 19).replace('T', ' ');
	}

	if (typeof value === 'object') {
		throw new TypeError('Cannot escape object');
	}

	value = value.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function( s) {
		switch(s) {
			case "\0": return "\\0";
			case "\n": return "\\n";
			case "\r": return "\\r";
			case "\b": return "\\b";
			case "\t": return "\\t";
			case "\x1a": return "\\Z";
			default: return "\\" + s;
		}
	});

	return "'" + value + "'";
}

/**
* Helper function to convert arguments to an array without triggering de-optimization in V8
* MUST be called via .apply
* @private
* @return {Array<mixed>}
*/
function arrayFromArguments () {
	var len = arguments.length;
	var args = new Array(len);
	for(var i = 0; i < len; ++i) {
		args[i] = arguments[i];
	}
	return args;
}
