
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