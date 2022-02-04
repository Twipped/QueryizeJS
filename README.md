# queryize.js

A no-frills chainable/fluent interface for constructing mutable MySQL queries with data binding/escapement.

[![NPM version](https://img.shields.io/npm/v/queryize.svg)](http://badge.fury.io/js/queryize)
[![Licensed MIT](https://img.shields.io/npm/l/queryize.svg)](https://github.com/Twipped/QueryizeJS/blob/master/LICENSE.txt)
[![Nodejs 8+](https://img.shields.io/badge/node.js-%3E=_8%20LTS-brightgreen.svg)](http://nodejs.org)
[![Downloads](http://img.shields.io/npm/dm/queryize.svg)](http://npmjs.org/queryize)
[![Build Status](https://img.shields.io/travis/Twipped/QueryizeJS.svg)](https://travis-ci.org/Twipped/QueryizeJS)

## Installation

NPM: `npm install queryize`

## Usage

In Node or another CommonJS environment:

```js
var queryize = require('queryize');
var query = queryize().select();
```

```js
var select = require('queryize').select;
var query = select();
```

**Visit [queryizejs.com](http://queryizejs.com/) for documentation.**

## Examples

```js
var select = require('queryize').select;
var q = select()
    .from('users', 'u')
    .innerJoin('passwords', {alias: 'p', on: {'u.id':'p.user_id'}})
    .where({'u.email': 'user@example.com'})
    .columns('u.id', 'p.hash')
    .compile();

//q.query contains SELECT u.id, p.hash FROM users u INNER JOIN passwords p ON (u.id = p.user_id) WHERE u.email = ?
//q.data contains  ['user@example.com']
```

```js
var queryize = require('queryize');
var q = queryize()
    .insert().into('users')
    .set({name: 'John Doe', email: 'user@example.com'})
    .compile();

//q.query contains INSERT INTO users SET u.name = ?, u.email = ?
//q.data contains  ['John Doe', 'user@example.com']
```

```js
var queryize = require('queryize');
var q = queryize()
    .update().table('users')
    .set({name: 'John Doe', email: 'user@example.com'})
    .where({'u.id':1})
    .compile();

//q.query contains UPDATE users SET u.name = ?, u.email = ? WHERE u.id = ?
//q.data contains  ['John Doe', 'user@example.com', 1]
```

```js
var queryize = require('queryize');
var q = queryize()
    .deleteFrom('users')
    .where({'u.id':1})
    .compile();

//q.query contains DELETE FROM users WHERE u.id = ?
//q.data contains  ['John Doe', 'user@example.com', 1]
```

## Running Unit Tests

From inside the repository root, run `npm install` to install the node-tap dependency.

Run `npm test` to execute the complete test suite.