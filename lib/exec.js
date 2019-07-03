
var proxmis   = require('proxmis');

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

	if (typeof connection.query !== 'function') {
		pcb(new TypeError('Connection object is not a mysql or mysql2 connection or pool.'));
		return pcb.promise;
	}

	var pcb = proxmis(callback);

	if (options) {
		connection.query(options, pcb);
	} else {
		connection.query(q.query, q.data, pcb);
	}

	return pcb.promise;
};
