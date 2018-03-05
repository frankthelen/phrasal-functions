# phrasal-functions

Functions with chained, fluent options.
Decorate existing objects (proxy).
Dynamic options (context-specific) and multiple paths.

[![Build Status](https://travis-ci.org/frankthelen/phrasal-functions.svg?branch=master)](https://travis-ci.org/frankthelen/phrasal-functions)
[![Coverage Status](https://coveralls.io/repos/github/frankthelen/phrasal-functions/badge.svg?branch=master)](https://coveralls.io/github/frankthelen/phrasal-functions?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/frankthelen/phrasal-functions.svg)](https://gemnasium.com/github.com/frankthelen/phrasal-functions)
[![Greenkeeper badge](https://badges.greenkeeper.io/frankthelen/phrasal-functions.svg)](https://greenkeeper.io/)
[![Maintainability](https://api.codeclimate.com/v1/badges/2b21f79b2657870c146f/maintainability)](https://codeclimate.com/github/frankthelen/phrasal-functions/maintainability)
[![node](https://img.shields.io/node/v/phrasal-functions.svg)]()
[![code style](https://img.shields.io/badge/code_style-airbnb-brightgreen.svg)](https://github.com/airbnb/javascript)
[![License Status](http://img.shields.io/npm/l/phrasal-functions.svg)]()

## Install

```batch
npm install phrasal-functions
```

## Usage

A quick example.
```javascript
const { phrasal } = require('phrasal-functions');

const make = phrasal({
  fn: (options, ...args) => console.log(options, args),
  path: [
    { key: 'who', values: ['my', 'your'] },
    { key: 'what', values: ['day', 'hour', 'minute'] },
  ],
});

make.my.day({ party: true });
// -> { who: 'my', what: 'day' } [{ party: true }]
```

## Features
### Phrasal function

Create functions that are called like real language phrases.
The phrasal options are passed to the function as its first argument.

```javascript
const { phrasal } = require('phrasal-functions');

const make = phrasal({
  fn: (options, arg) => ({ ...options, ...arg, foo: 'baz' }),
  path: [
    { key: 'who', values: ['my', 'your'] },
    { key: 'what', values: ['day', 'hour', 'minute'] },
  ],
});

const result = make.my.day({ party: true });
console.log(result);
// -> { who: 'my', what: 'day', party: true, foo: 'baz' }
```

### Decoration (Proxy)
### Dynamic options [TODO]
### Fix options
### Async functions
### Multiple paths [TODO]
