
module.exports = function () {

	var dataBindings = {},

	var attributes = {
		tableName: false,
		tableAlias: false,
		where: [],
		whereBoolean: 'AND',
		set: [],
		returnColumns: ['*'],
		joins: [],
		orderBy: false,
		groupBy: false,
		distinct: false,
		builder: false
	};

	// creates a string that is unique to this runtime session
	// (based on lo-dash.uniqueId)
	var idCounter = 0;
	function uniqueId(prefix) {
		var id = ++idCounter + '';
		return prefix ? prefix + id : id;
	}

	var isArray = Array.isArray;

	function flatten(input) {
		var result = [];

		function descend(level) {
			if (isArray(level)) {
				level.forEach(descend);
			} else if (typeof level === 'object') {
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

	function createBinding (data, modifier) {
		if (data === true) return 'TRUE';
		if (data === false) return 'FALSE';

		if (typeof data === 'object') {
			// if we've got a date, convert it into a mysql ready datestamp
			if (data instanceof Date) {
				data = data.toISOString().slice(0, 19).replace('T', ' ');
			} else {
				throw new TypeError('Received unparsable object as field value.');
			}
		}

		var key = '{{' + uniqueId('binding') + '}}';

		dataBindings[key] = data;

		return modifier ? [modifier, '(', key, ')'].join() : key;
	}

	function where(clause, value, operator, modifier) {

		// if a value is defined, then we're performing a field > value comparison
		// and must parse that first.
		if (value !== undefined) {
			clause = processWhereCondition(clause, value, operator, modifier);

		// if there was no value, check to see if we got an object based where definition
		} else if (typeof clause === 'object' && !isArray(clause)) {
			clause = processWhereObject(clause, operator, modifier);
		}

		// if we've got an array at this point, then we should parse it as if it were
		// a collection of possible conditions in an OR
		if (isArray(clause)) {
			clause = flatten(clause);
			var l = clause.length;
			if (l === 1) {
				clause = clause[0];
			} else if (l > 1) {
				clause = '(' + clause.join(' OR ') + ')';
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

	function processWhereCondition(field, value, operator, modifier) {
		if (!operator) operator = '=';

		if (isArray(field)) {
			return field.map(function (field) {
				return processWhereCondition(field, value, operator, modifier);
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
				return value.map(function (value) { return processWhereCondition(field, value, operator, modifier); });

			}
		}

		return [field, operator, createBinding(value, modifier)].join(' ');
	}

	function processWhereObject(clause, operator, modifier) {
		clause = Object.keys(clause).map(function (field) {
			return processWhereCondition(field, clause[field], operator, modifier);
		});

		if (clause.length === 1) {
			return clause[0];
		} else if (clause.length > 1) {
			return '(' + clause.join(' AND ') + ')';
		}

		return undefined;
	}

	function whereBetween (field, from, to, modifier) {
		where([field, 'BETWEEN', createBinding(from, modifier), 'AND', createBinding(to, modifier)].join(' '));

		return this;
	}

	var queryObj = {
		createBinding: createBinding,

		insertBinding: function (key, data) {
			dataBindings[key] = (key.substr(0,2) === '{{' ? data : '{{' + data + '}}');
			return this;
		},

		select: function () {
			attributes.builder = buildSelect;
			return this;
		},

		deleet: function () {
			attributes.builder = buildDelete;
			return this;
		},

		insert: function () {
			attributes.builder = buildInsert;
			return this;
		},

		update: function () {
			attributes.builder = buildUpdate;
			return this;
		},

		from: function (tablename, alias) {
			attributes.tableName = tablename;
			if (alias !== undefined) {
				attributes.alias = alias;
			}
			return this;
		},

		where: where,

		whereLike: function (field, value, modifier) {
			where(field, value, 'LIKE', modifier);
			return this;
		},

		whereNot: function (field, value, modifier) {
			where(field, value, '!=', modifier);
			return this;
		},

		whereInRange: function (field, from, to, modifier) {
			if (from !== undefined && to !== undefined) {
				whereBetween(field, from, to, modifier);
			} else if (from !== undefined) {
				where(field, from, '>=', modifier);
			} else if (to !== undefined) {
				where(field, to, '<=', modifier);
			}
			return this;
		},

		whereBetween: whereBetween


	};

	function buildSelect() {

	}

	function buildUpdate() {

	}

	function buildInsert() {

	}

	function buildDelete() {

	}


	
	return queryObj;

};
