
/**
 * Query Builder Functions used by query.compile
 * @type {Object}
 */

exports.select = function buildSelect () {
	var columns = this._attributes.columns.join(', ');
	if (this._attributes.distinct) columns = 'DISTINCT ' + columns;

	var q = [ 'SELECT', columns, 'FROM', this._buildTableName() ];

	q = q.concat(this._attributes.joins);

	if (this._attributes.where.length) {
		q.push('WHERE');
		q.push(this._attributes.where.join(this._buildWhereBoolean()));
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
};

exports.update = function buildUpdate () {
	var q = [ 'UPDATE', this._buildTableName() ];

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
	q.push(this._attributes.where.join(this._buildWhereBoolean()));

	q = q.join(' ');

	return q;
};

exports.insert = function buildInsert () {
	var q = [ (this._attributes.insertMode || 'INSERT') + ' INTO', this._buildTableName() ];

	if (!this._attributes.set.length) {
		throw new Error('No values to insert have been defined');
	}

	q.push('SET');
	q.push(this._attributes.set.join(', '));

	q = q.join(' ');

	return q;
};

exports.insertMultiple = function buildMultiRowInsert () {
	// This is a special builder function which returns a tuple of query + data instead of just a query string.

	var data = [];
	var q = [ (this._attributes.insertMode || 'INSERT') + ' INTO', this._buildTableName(), '(' ];
	var columns;

	if (this._attributes.columns.length) {
		columns = this._attributes.columns.join(', ');
		if (columns && columns !== '*') q.push(columns);
	} else {
		throw new Error('No columns have been defined? This error should not be reachable!');
	}

	q.push(') VALUES');

	columns = this._attributes.columns;

	var sets = [];

	this._attributes.rows.forEach((row) => {
		var set = columns.map((column) => {
			if (typeof row[column] === 'undefined' || row[column] === null) {
				return 'NULL';
			}

			if (typeof row[column] === 'object' && typeof row[column].raw === 'string') {
				return row[column].raw;
			}

			if (row[column] instanceof Date) {
				// format date directly into the query
				return '\'' + row[column].toISOString().slice(0, 19).replace('T', ' ') + '\'';
			}

			// booleans
			if (row[column] === true) return 'TRUE';
			if (row[column] === false) return 'FALSE';

			// everything else
			data.push(row[column]);
			return '?';
		});

		sets.push('(' + set.join(', ') + ')');
	});

	q.push(sets.join(', '));

	return {
		query: q.join(' '),
		data,
	};
};

exports.delete = function buildDelete () {
	var q = [ 'DELETE' ];

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
	q.push(this._attributes.where.join(this._buildWhereBoolean()));

	q = q.join(' ');

	return q;
};
