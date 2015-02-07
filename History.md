1.1.0 / 2015-02-06
==================

  * Date objects are now converted to MySQL DATETIME using the timezone on the date instead of always being UTC.

1.0.2 / 2015-02-06
==================

  * Fixed a bug where using a raw subquery as a join target could lose part of the subquery.

1.0.0 / 2014-12-16
==================

  * Added Multi-Insert Mode
    - Causes Queryize to create insert queries in the format of `INSERT INTO table (columnA, columnB) VALUES (valueA, valueB)`, supporting multiple rows of data to be inserted.
    - Activated first time `query.addRow` is used.
  * Added support for REPLACE INTO queries via `query.replace()` as an alternative to `query.insert()`
  * Added support for passing raw query functions as `query.set()` values
    - Example: `query.set('dts', {raw:'NOW()'});
  * Added `query.addColumn` to append extra columns outside of the `query.column` full set.
  * Fixed `query.set()` not properly overwriting a previously defined key/value pair.
  * INTERNAL: Query builders can now return a fully formed query object instead of a string.


0.6.0 / 2014-09-12
==================

  * Added `query.emitted()` as an alternative to `query.exec()`.
    - node-mysql does not return a row emitter if a callback is provided. Since a callback is always provided as
      part of the promise extension, this made it impossible to receive a row emitter when using node-mysql
      (node-mysql2 does not have this limitation). This new function works around that limitation.


0.5.1 / 2014-09-13
==================

  * Removed a console.log that slipped in.


0.5.0 / 2014-09-12
==================

  * Added ability to provide a queryize object as a compound where condition.

0.4.0 / 2014-09-03
==================

  * Added support for using queryize objects as subqueries in columns, joins and select from.
    - Use `query.as(name)` to define the name for the subquery. If omitted, queryize will create a random name.
  * Fixed bug in `query.debug()` that prevented it from enabling without passing true.
  * Added documentation examples for all possible ways you can use `query.exec()`

0.3.0 / 2014-09-02
==================

  * Major internal refactor to make the query object more externally extensible
    - Query state is now stored on `this._attributes` instead of in a local variable.
    - `queryize.fn` now contains the prototype of the queryize query object. See lib/mutators.js for the contents.
  * Added `query.clone()` to duplicate a query state inline
  * Changed `query.deleet()` to `query.delete()`
  * Switched to using lodash clone and assign functions instead of local versions.
  * Added `query.disableBoundParameters` and deprecated `query.useBoundParameters`
  * Fixed several V8 optimization killers
  * Fixed bugs in `query.limit()` and `query.distinct()`
  * Fixed edge case in `query.where()`
  * Increased test coverage
  * Improved documentation


0.2.0 / 2014-08-22
==================

  * Added support for node-mysql2 `connection.execute()` functions. Prefers over `connection.query()`
  * `query.exec()` now extends the node-mysql(2) query emitter object with `.then()` and `.catch()`, allowing use as a promise.
  * Lots and lots of new documentation in code
  * Switched to using a custom dox based documentation generator
  * Added Travis-CI testing
  * Launched http://queryizejs.com


0.1.3 / 2014-02-17
==================

  * Added `query.exec()` and deprecated `query.run()` to be more consistent with other database libraries (eg, Mongoose)

0.1.2 / 2014-02-17
==================

  * Fixed showstopper bug in `query.run()`


0.1.1 / 2014-02-03
==================

  * Changed query builders into a function map so that attributes is storing a name instead of a function. This makes it serializable and easier to duplicate.
  * Added run() function as shortcut for node-mysql query command.
  * Started documenting

0.1.1 / 2014-01-14
==================

  * Initial release