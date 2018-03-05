# phrasal-functions

Functions with chained, fluent options.
Decorate existing objects (proxy).

[![Build Status](https://travis-ci.org/frankthelen/phrasal-functions.svg?branch=master)](https://travis-ci.org/frankthelen/phrasal-functions)
[![Coverage Status](https://coveralls.io/repos/github/frankthelen/phrasal-functions/badge.svg?branch=master)](https://coveralls.io/github/frankthelen/phrasal-functions?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/frankthelen/phrasal-functions.svg)](https://gemnasium.com/github.com/frankthelen/phrasal-functions)
[![Greenkeeper badge](https://badges.greenkeeper.io/frankthelen/phrasal-functions.svg)](https://greenkeeper.io/)
[![Maintainability](https://api.codeclimate.com/v1/badges/25b61ef7569593524e66/maintainability)](https://codeclimate.com/github/frankthelen/phrasal-functions/maintainability)
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
// -> { who: 'my', what: 'day', party: true, foo: 'baz' }
```

### Decoration (Proxy)

You can also decorate (proxy) an existing object with a new phrasal function.
Use `proxy` for that purpose.
The function `fn` will implicitly have `this` bound to the proxied object.
To explicitly change this, provide a `bind` property with the desired object.

```javascript
const { proxy } = require('phrasal-functions');

const johnObj = { name: 'John' };
const john = proxy(johnObj, {
  fn: function (options, arg) {
    return { who: this.name, ...options, ...arg };
  },
  // bind: obj,
  path: [
    { key: 'say' },
    { key: 'what', values: ['hello', 'goodbye', 'boo'] },
  ],
});

const result = john.say.goodbye({ to: 'Joe' });
// -> { who: 'John', say: 'say', what: 'goodbye', to: 'Joe' }
```

### Dynamic options

In some cases, it is useful to create the syntax dynamically.
This can be done by providing a function to `values` instead of an array of strings.
The function, of course, has to return an array of strings.
It gets the options as collected so far and has `this` bound properly (if applicable).

```javascript
const { phrasal } = require('phrasal-functions');

const my = phrasal({
  fn: (options, ...args) => { ... },
  path: [
    { key: 'animal', values: ['dog', 'cat'] },
    { key: 'is' },
    { key: 'action',
      values: ({ animal }) =>
        (animal === 'dog' ? ['barking', 'chewing', 'playing'] : ['purring', 'playing']) },
  ],
});
my.dog.is.chewing();
my.cat.is.purring();
```

### Fix options

`{ key: 'say' }` and `{ key: 'is' }` in the examples above are *fix options*.
It's simply a shorthand for, e.g., `{ key: 'say', values: ['say'] }`.

### Async functions

Simply provide an `async` function that returns a promise and use `await` to call the function:
```javascript
const my = phrasal({
  fn: async () => Promise.resolve(...),
  ...
});
await my.phrasal.fun();
```

### Multiple paths [TODO]
