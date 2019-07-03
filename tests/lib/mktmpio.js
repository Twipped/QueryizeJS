
var Promise = require('bluebird');
var mktmpio = require('mktmpio');
var mysql = require('mysql2/promise');
var schema = require('../lib/testdb.js');

var current;

exports.create = function () {
	if (current) return Promise.resolve(current);

	return new Promise((resolve, reject) => {
		mktmpio.create('mysql', (err, result) => {
			if (err) return reject(err);
			current = result;
			return resolve(result);
		});
	}).delay(500);
};

exports.populate = function () {
	return mysql.createConnection({
		host: current.host,
		port: current.port,
		user: 'root',
		password: current.password,
	}).then((connection) =>
		Promise.each(schema, (sql) => connection.query(sql))
			.then(() => connection.end())
	);
};

exports.destroy = function () {
	if (!current) return Promise.resolve();
	return new Promise((resolve, reject) => {
		mktmpio.destroy(current.id, (err, result) => {
			if (err || result.error) return reject(err);
			current = null;
			return resolve(result);
		});
	});
};
