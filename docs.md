# Queryize <sup>v0.1.1</sup>

<!-- div -->


<!-- div -->

## <a id="queryize"></a>`queryize`
* [`queryize`](#queryizeoriginal)
* [`queryize.select`](#queryizeselect)
* [`queryize.update`](#queryizeupdate)
* [`queryize.insert`](#queryizeinsert)
* [`queryize.deleteFrom`](#queryizedeletefrom)
* [`queryize.deleet`](#queryizedeletefrom)

<!-- /div -->


<!-- div -->

## `query`
* [`query`](#query)
* [`query.insertBinding`](#queryinsertbindingkey-value)
* [`query.createBinding`](#querycreatebindingvalue--modifier)
* [`query.select`](#queryselectarguments)
* [`query.deleteFrom`](#querydeletefromtablename-alias)
* [`query.deleet`](#querydeletefromtablename-alias)
* [`query.insert`](#queryinsertarguments)
* [`query.update`](#queryupdatetablename-alias)
* [`query.table`](#querytabletablename--alias)
* [`query.into`](#querytabletablename--alias)
* [`query.database`](#querydatabasedbname--tablename-alias)
* [`query.columns`](#querycolumnscolumns-column2)
* [`query.comparisonMethod`](#querycomparisonmethodcondition)
* [`query.where`](#querywhereclause-field-value--operator-modifier-pairs--operator-modifier)
* [`query.whereBetween`](#querywherebetweenfield-from-to-modifier)
* [`query.whereLike`](#querywherelikefield-value--modifier)
* [`query.whereNot`](#querywherenotfield-value--modifier)
* [`query.whereNotLike`](#querywherenotlikefield-value--modifier-description)
* [`query.whereInRange`](#querywhereinrangefield--from-to-modifier)
* [`query.orderBy`](#queryorderbycolumns)
* [`query.groupBy`](#querygroupbycolumns)
* [`query.distinct`](#querydistincton)
* [`query.limit`](#querylimitmax--offset)
* [`query.set`](#querysetstatement-column-value-data-modifier)
* [`query.join`](#queryjoinstatement-tablename-options-options)
* [`query.innerJoin`](#queryinnerjoin)
* [`query.leftJoin`](#queryleftjoin)
* [`query.rightJoin`](#queryrightjoin)
* [`query.compile`](#querycompile)
* [`query.exec`](#queryexecconnection--options-callback)
* [`query.debug`](#querydebugenable)
* [`query.useBoundParameters`](#queryuseboundparametersenable)

<!-- /div -->


<!-- /div -->


<!-- div -->


<!-- div -->

## `queryize`

<!-- div -->

### <a id="queryizeoriginal"></a>`queryize([original])`
<a href="#queryizeoriginal">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L25 "View in source") [&#x24C9;][1]

Creates a `query` object which encapsulates the state of the query to be generated and provides the methods to manipulate that query.

#### Arguments
1. `[original]` *(query|Object)*: An existing query object to duplicate.

* * *

<!-- /div -->


<!-- div -->

### <a id="queryizeselect"></a>`queryize.select`
<a href="#queryizeselect">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1396 "View in source") [&#x24C9;][1]

*(Unknown)*: Shortcut for creating a new select query

See `query.select()` for details.

* * *

<!-- /div -->


<!-- div -->

### <a id="queryizeupdate"></a>`queryize.update`
<a href="#queryizeupdate">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1411 "View in source") [&#x24C9;][1]

*(Unknown)*: Shortcut for creating a new update query

See `query.update()` for details.

* * *

<!-- /div -->


<!-- div -->

### <a id="queryizeinsert"></a>`queryize.insert`
<a href="#queryizeinsert">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1426 "View in source") [&#x24C9;][1]

*(Unknown)*: Shortcut for creating a new insert query

See `query.insert()` for details.

* * *

<!-- /div -->


<!-- div -->

### <a id="queryizedeletefrom"></a>`queryize.deleteFrom`
<a href="#queryizedeletefrom">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1442 "View in source") [&#x24C9;][1]

*(Unknown)*: Shortcut for creating a new delete query

See `query.select()` for details.

#### Aliases
*deleet*

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `query`

<!-- div -->

### <a id="query"></a>`query`
<a href="#query">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1308 "View in source") [&#x24C9;][1]

*(Object)*: @typedef query

* * *

<!-- /div -->


<!-- div -->

### <a id="queryinsertbindingkey-value"></a>`query.insertBinding(key, value)`
<a href="#queryinsertbindingkey-value">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L218 "View in source") [&#x24C9;][1]

Stores the passed `value` under a data binding with the `key` name.
	 * This allows for explicit usage of bindings within query strings.
	 *

#### Arguments
1. `key` *(string)*: The binding name to store the value under
2. `value` *(*)*: The data to be stored

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querycreatebindingvalue--modifier"></a>`query.createBinding(value [, modifier])`
<a href="#querycreatebindingvalue--modifier">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L258 "View in source") [&#x24C9;][1]

Stores the passed `data` into the data bindings collection and returns a
	 * unique string representation of that data for use in the query.
	 *
	 * Data bindings in queryize are represented by a key name surrounded by
	 * double brackets.  These values are then converted to question marks after
	 * the query is compiled, with the values appended to the data array.
	 *
	 * If a `modifier` function name is provided, the returned binding will be wrapped with that MySQL function.
	 *

#### Arguments
1. `value` *(*)*: The data to be stored
2. `[modifier]` *(string)*: A MySQL function to wrap the binding in when it is inserted into SQL.

#### Returns
*(query)*: Exports `this` for chaining

#### Example
```js
query.createBinding('name@example.com');
// => "{{binding0d}}"

query.createBinding('2013-06-18', 'DATE');
// => "DATE({{binding4f}})"
```

* * *

<!-- /div -->


<!-- div -->

### <a id="queryselectarguments"></a>`query.select([arguments])`
<a href="#queryselectarguments">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L290 "View in source") [&#x24C9;][1]

Marks the query as being a SELECT statement.
	 *
	 * One or more columns or an array of columns to select from may be passed
	 * in as arguments.  See `query.columns()` for more details.
	 *

#### Arguments
1. `[arguments]` *(...*)*: All arguments received are passed to a `query.columns()` call

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querydeletefromtablename-alias"></a>`query.deleteFrom([tablename, alias])`
<a href="#querydeletefromtablename-alias">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L310 "View in source") [&#x24C9;][1]

Marks the query as being a DELETE statement
	 *
	 * Supports passing the target table and alias as syntatic sugar.  See `query.from()` for more details.
	 *

#### Aliases
*deleet*

#### Arguments
1. `[tablename]` *(string|Array<string>)*: Table to delete from. If an array is passed, defines the tables that will be deleted from in a multi-table delete.
2. `[alias]` *(string)*: An alias to use for the table

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="queryinsertarguments"></a>`query.insert([arguments])`
<a href="#queryinsertarguments">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L334 "View in source") [&#x24C9;][1]

Marks the query as being an INSERT statement
	 *

#### Arguments
1. `[arguments]` *(...*)*: All arguments received are passed to a `query.set()` call

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="queryupdatetablename-alias"></a>`query.update([tablename, alias])`
<a href="#queryupdatetablename-alias">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L351 "View in source") [&#x24C9;][1]

Marks the query as being an UPDATE statement
	 *

#### Arguments
1. `[tablename]` *(string)*: Table to update
2. `[alias]` *(string)*: An alias to use for the table

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querytabletablename--alias"></a>`query.table(tablename [, alias])`
<a href="#querytabletablename--alias">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L370 "View in source") [&#x24C9;][1]

Defines the table that the query should be performed on
	 *

#### Aliases
*into*

#### Arguments
1. `tablename` *(string)*:
2. `[alias]` *(string)*: An alias to use for the table

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querydatabasedbname--tablename-alias"></a>`query.database(dbname [, tablename, alias])`
<a href="#querydatabasedbname--tablename-alias">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L392 "View in source") [&#x24C9;][1]

Defines what database that the query should be performed on.
	 *
	 * This is only nessisary if your connection has not defined a database
	 * to use, or the query needs to act upon a database other than the one
	 * currently in use.
	 *

#### Arguments
1. `dbname` *(string)*:
2. `[tablename]` *(string)*:
3. `[alias]` *(string)*: An alias to use for the table

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querycolumnscolumns-column2"></a>`query.columns(columns, column2)`
<a href="#querycolumnscolumns-column2">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L426 "View in source") [&#x24C9;][1]

Defines what columns a SELECT statement should return, or what tables
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

#### Arguments
1. `columns` *(string|Array<string>)*:
2. `column2` *(...string)*:

#### Returns
*(query)*: Exports `this` for chaining

#### Example
```js
query.columns('users.*', 'passwords.hash as password_hash');

query.columns(['username', 'firstname', 'lastname']);
```

* * *

<!-- /div -->


<!-- div -->

### <a id="querycomparisonmethodcondition"></a>`query.comparisonMethod(condition)`
<a href="#querycomparisonmethodcondition">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L461 "View in source") [&#x24C9;][1]

Controls the boolean operator used to combine multiple WHERE clauses
	 *
	 * By default, Queryize will combine all top level WHERE clauses with AND operators.
	 *

#### Arguments
1. `condition` *(string)*: "AND" or "OR"

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querywhereclause-field-value--operator-modifier-pairs--operator-modifier"></a>`query.where(clause, field, value [, operator='=', modifier], pairs [, operator='=', modifier])`
<a href="#querywhereclause-field-value--operator-modifier-pairs--operator-modifier">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L549 "View in source") [&#x24C9;][1]

Adds one or more WHERE clauses to the query.
	 *
	 * Calling multiple times will append more clauses onto the stack.
	 *
	 * Calling without any arguments will empty the stack.
	 *
	 * If an `operator` is provided, it will be used for all comparisons derived from this call.
	 *
	 * If a `modifier` function name is provided, the returned binding will be wrapped with that MySQL function.
	 *

#### Arguments
1. `clause` *(string)*: A pre-written WHERE statement for direct insertion into the query
2. `field` *(string|Array<string>)*: The table field(s) to match against
3. `value` *(string|Array<string>)*: The value(s) to match with *(if more than one, performs an OR comparison of each)*
4. `[operator='=']` *(string)*: The operator to use when performing the comparison *(e.g. =, !=, >, LIKE, IS NOT, etc)*
5. `[modifier]` *(string)*: A MySQL function to wrap the binding in when it is inserted into SQL.
6. `pairs` *(Object)*: Collection of field/value pairs to match against
7. `[operator='=']` *(string)*: The operator to use when performing the comparison *(e.g. =, !=, >, LIKE, IS NOT, etc)*
8. `[modifier]` *(string)*: A MySQL function to wrap the binding in when it is inserted into SQL.

#### Returns
*(query)*: Exports `this` for chaining

#### Example
```js
query.where()
//removes all existing where clauses

query.where('password IS NOT NULL')
// WHERE password IS NOT NULL

query.where('age', 21, '<')
// WHERE age < ?
// Data: [21]

query.where('created', new Date('2014-01-01'), '>=', 'DATE')
// WHERE created >= DATE(?)
// Data: ['2014-01-01 00:00:00']

query.where(['account.balance > 0', 'account.gratis IS TRUE'])
// WHERE account.balance > 0 OR account.gratis IS TRUE

query.where(['AND', 'client.active IS TRUE', 'client.paidthru < NOW()'])
// WHERE client.active IS TRUE AND client.paidthru < NOW()

query.where({studio:'Paramount', franchise: 'Star Trek' });
// WHERE studio = ? AND franchise = ?
// Data: ['Paramount', 'Star Trek']

query.where({'property.ownership': ['Own', 'Rent']})
// WHERE property.ownership IN (?, ?)
// Data: ['Own', 'Rent']

query.where({'user.gender':'M, not: true, 'profile.spouse': null})
// WHERE user.gender = ? AND profile.spouse != NULL
// Data: ['M']
```

* * *

<!-- /div -->


<!-- div -->

### <a id="querywherebetweenfield-from-to-modifier"></a>`query.whereBetween(field, from, to, modifier)`
<a href="#querywherebetweenfield-from-to-modifier">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L693 "View in source") [&#x24C9;][1]

Adds a where condition for a field between two values.
	 *

#### Arguments
1. `field` *(string)*:
2. `from` *(string|number)*:
3. `to` *(string|number)*:
4. `modifier` *(string)*:

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querywherelikefield-value--modifier"></a>`query.whereLike(field, value [, modifier])`
<a href="#querywherelikefield-value--modifier">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L709 "View in source") [&#x24C9;][1]

Shortcut for performing a LIKE comparison on a field and value
	 *

#### Arguments
1. `field` *(string|Array<string>|Object)*:
2. `value` *(string|number|Array<string|number>)*:
3. `[modifier]` *(string)*:

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querywherenotfield-value--modifier"></a>`query.whereNot(field, value [, modifier])`
<a href="#querywherenotfield-value--modifier">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L728 "View in source") [&#x24C9;][1]

Shortcut for performing an != comparisoon on a field and value
	 *

#### Arguments
1. `field` *(string|Array<string>|Object)*:
2. `value` *(string|number|Array<string|number>)*:
3. `[modifier]` *(string)*:

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querywherenotlikefield-value--modifier-description"></a>`query.whereNotLike(field, value [, modifier] [description])`
<a href="#querywherenotlikefield-value--modifier-description">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L747 "View in source") [&#x24C9;][1]

Shortcut for performing a NOT LIKE comparison on a field and value
	 *

#### Arguments
1. `field` *(string|Array<string>|Object)*: [description]
2. `value` *(string|number|Array<string|number>)*: [description]
3. `[modifier] [description]` *(string)*:

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querywhereinrangefield--from-to-modifier"></a>`query.whereInRange(field [, from, to, modifier])`
<a href="#querywhereinrangefield--from-to-modifier">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L783 "View in source") [&#x24C9;][1]

Creates a where condition for if a field fit within a boundry of values.
	 *
	 * Omitting/passing null to the `from` or `to` arguments will make the range boundless on that side.
	 *

#### Arguments
1. `field` *(string|Array<string>)*:
2. `[from]` *(string|number|Date)*:
3. `[to]` *(string|number|Date)*:
4. `[modifier]` *(string)*:

#### Returns
*(query)*: Exports `this` for chaining

#### Example
```js
query.whereInRange('profile.income', 18000, 60000)
// Where profile.income BETWEEN ? AND ?
// Data: [18000, 60000]

query.whereInRange('age', 21)
// WHERE age >= ?
// Data: [21]

query.whereInRange('product.cost', null, 100)
// WHERE product.cost <= ?
// Data: [100]
```

* * *

<!-- /div -->


<!-- div -->

### <a id="queryorderbycolumns"></a>`query.orderBy(columns)`
<a href="#queryorderbycolumns">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L808 "View in source") [&#x24C9;][1]

Defines what columns a select statement should use to sort the results.
	 * Accepts either an array of `columns`, or multiple `column` arguments.
	 *
	 * Calling multiple times will replace the previous sort order with the new values.
	 *

#### Arguments
1. `columns` *(...string|Array<string>)*: Column names can be in any format allowed in a MySQL statement.

#### Returns
*(query)*: Exports `this` for chaining

#### Example
```js
query.orderBy('category', 'DATE(date_posted) DESC');
```

* * *

<!-- /div -->


<!-- div -->

### <a id="querygroupbycolumns"></a>`query.groupBy(columns)`
<a href="#querygroupbycolumns">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L831 "View in source") [&#x24C9;][1]

Defines what columns and conditions a select statement should group the results under.
	 *
	 * Accepts either an array of `columns`, or multiple `column` arguments.
	 *
	 * Calling multiple times will replace the previous grouping rules with the new values.
	 *

#### Arguments
1. `columns` *(...string|Array<string>)*: Column names can be in any format allowed in a MySQL statement.

#### Returns
*(query)*: Exports `this` for chaining

#### Example
```js
query.groupBy('id');
```

* * *

<!-- /div -->


<!-- div -->

### <a id="querydistincton"></a>`query.distinct(on)`
<a href="#querydistincton">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L847 "View in source") [&#x24C9;][1]

Defines if a SELECT statement should return distinct results only
	 *

#### Arguments
1. `on` *(boolean)*:

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querylimitmax--offset"></a>`query.limit(max [, offset])`
<a href="#querylimitmax--offset">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L861 "View in source") [&#x24C9;][1]

Defines the maximum results the query should return, and the starting offset of the first row within a set.
	 *

#### Arguments
1. `max` *(number)*: Total results to return
2. `[offset]` *(number)*: Starting offset of first row within the results

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querysetstatement-column-value-data-modifier"></a>`query.set(statement, column, value, data, modifier)`
<a href="#querysetstatement-column-value-data-modifier">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L902 "View in source") [&#x24C9;][1]

Defines what data to set the specified columns to during INSERT and UPDATE queries
	 *

#### Arguments
1. `statement` *(string)*: A fully written set condition
2. `column` *(string)*:
3. `value` *(string|number)*:
4. `data` *(Object)*: A plain object collection of column/value pairs
5. `modifier` *(string)*: [description]

#### Returns
*(query)*: Exports `this` for chaining

#### Example
```js
query.set('user.lastlogin = NOW()')
// SET user.lastlogin = NOW()

query.set('address', '9 Pseudopolis Yard')
// SET address = ?
// Data: ['9 Pseudopolis Yard']

query.set({firstname: 'Susan', lastname: 'Sto Helet'})
// SET firstname = ?, lastname = ?
// DATA: ['Susan', 'Sto Helet']
```

* * *

<!-- /div -->


<!-- div -->

### <a id="queryjoinstatement-tablename-options-options"></a>`query.join(statement, tablename, options, options)`
<a href="#queryjoinstatement-tablename-options-options">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L977 "View in source") [&#x24C9;][1]

Adds a table join to the query.
	 *
	 * Queryize will append any missing JOIN command at the beginning of a statement
	 *

#### Arguments
1. `statement` *(string)*: Fully formed join statement
2. `tablename` *(string)*:
3. `options` *(Object)*: Plain object containing options for the join
4. `options` *(Object)*: Plain object containing options for the join

#### Returns
*(query)*: Exports `this` for chaining

#### Example
```js
query.join('orders o ON o.client_id = c.id')
query.join('JOIN orders o ON o.client_id = c.id')
query.join('orders o ON o.client_id = c.id')
query.join('orders', {alias: 'o', on: 'o.client_id = c.id'})
query.join('orders', {alias: 'o', on: {'o.client_id':'c.id'})
query.join({table: 'orders', alias: 'o', on: {'o.client_id':'c.id'})
// JOIN orders o ON o.client_id = c.id

query.join('LEFT JOIN orders o ON o.client_id = c.id')
query.join('orders', {alias: 'o', type: 'LEFT', on: 'o.client_id = c.id'})
query.join({table: 'orders', alias: 'o', type: 'LEFT' on: {'o.client_id':'c.id'})
// LEFT JOIN orders o ON o.client_id = c.id

query.join('orders', {using: ['client_id', 'user_id'])
// JOIN orders USING (client_id, user_id)

query.join('orders', {on: {'o.client_id':'c.id', not:true, o.status: [4,5]})
// JOIN orders ON o.client_id = c.id AND o.status NOT IN (?,?)
// Data: [4, 5]

query.join('orders', {on: {'o.client_id':'c.id', not:true, o.condition: {data: 'A'}})
// JOIN orders ON o.client_id = c.id AND o.status != ?
// Data: ['A']
```

* * *

<!-- /div -->


<!-- div -->

### <a id="queryinnerjoin"></a>`query.innerJoin()`
<a href="#queryinnerjoin">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1032 "View in source") [&#x24C9;][1]

Shortcut for creating an INNER JOIN
	 *
	 * See `query.join()` for argument details
	 *

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="queryleftjoin"></a>`query.leftJoin()`
<a href="#queryleftjoin">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1042 "View in source") [&#x24C9;][1]

null

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="queryrightjoin"></a>`query.rightJoin()`
<a href="#queryrightjoin">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1052 "View in source") [&#x24C9;][1]

null

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="querycompile"></a>`query.compile`
<a href="#querycompile">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1252 "View in source") [&#x24C9;][1]

*(Unknown)*: Compiles the final MySQL query

* * *

<!-- /div -->


<!-- div -->

### <a id="queryexecconnection--options-callback"></a>`query.exec(connection [, options, callback])`
<a href="#queryexecconnection--options-callback">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1283 "View in source") [&#x24C9;][1]

null

#### Arguments
1. `connection` *(Object)*: node-mysql connection object
2. `[options]` *(Object)*: Options object to be passed to `connection.query` with the query string and data mixed in.
3. `[callback]` *(runCallback)*: Callback function to be invoked when the query completes.

* * *

<!-- /div -->


<!-- div -->

### <a id="querydebugenable"></a>`query.debug(enable)`
<a href="#querydebugenable">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1319 "View in source") [&#x24C9;][1]

If passed a truthy value, `query.run()` will output the compiled query to the console.
		 *

#### Arguments
1. `enable` *(boolean)*:

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- div -->

### <a id="queryuseboundparametersenable"></a>`query.useBoundParameters(enable)`
<a href="#queryuseboundparametersenable">#</a> [&#x24C8;](https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js#L1339 "View in source") [&#x24C9;][1]

Controls if compiled queries should have values replaced with placeholders for
		 * data binding, or simply have escaped values directly in the query.
		 *
		 * By default, queryize will use data binding.  Passing false to this function will disable this behavior.
		 *
		 * You can also set `queryize.useBoundParameters = false` to disable databinding for all queries
		 *

#### Arguments
1. `enable` *(boolean)*:

#### Returns
*(query)*: Exports `this` for chaining

* * *

<!-- /div -->


<!-- /div -->


<!-- /div -->


  [1]: #queryize "Jump back to the TOC."