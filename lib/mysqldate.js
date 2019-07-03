

/**
 * Formats a Date object into a MySQL DATETIME
 * @param  {Date} date [description]
 * @private
 * @return {string}      [description]
 */
module.exports = exports = function mysqlDate (input) {
	var date = new Date(input.getTime());
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

	var y = date.getFullYear();
	var m = ('0' + (date.getMonth() + 1)).substr(-2);
	var d = ('0' + date.getDate()).substr(-2);
	var h = ('0' + date.getHours()).substr(-2);
	var i = ('0' + date.getMinutes()).substr(-2);
	var s = ('0' + date.getSeconds()).substr(-2);

	return y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
}
