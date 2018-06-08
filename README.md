# phrasal-functions

Functions with chained, fluent options.

[![Build Status](https://travis-ci.org/frankthelen/phrasal-functions.svg?branch=master)](https://travis-ci.org/frankthelen/phrasal-functions)
[![Coverage Status](https://coveralls.io/repos/github/frankthelen/phrasal-functions/badge.svg?branch=master)](https://coveralls.io/github/frankthelen/phrasal-functions?branch=master)
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

You can also decorate (proxy) an existing object with a phrasal function.
Use `proxy` for that purpose with the object as first argument.
The function `fn` will implicitly have `this` bound to the proxied object
(unless you use an ES6 arrow function which doesn't have `this` by definition).
To explicitly change `this` to another object, you may provide a `bind` property with the desired object.

```javascript
const { proxy } = require('phrasal-functions');

const johnObj = { name: 'John' };
const john = proxy(johnObj, {
  fn: function (options, arg) {
    return { who: this.name, ...options, ...arg };
  },
  // bind: otherObj,
  path: [
    { key: 'say' },
    { key: 'what', values: ['hello', 'goodbye', 'boo'] },
  ],
});

const result = john.say.goodbye({ to: 'Joe' });
// -> { who: 'John', say: 'say', what: 'goodbye', to: 'Joe' }
```

`{ key: 'say' }` in the example above is a *fix option*
which is a shorthand for `{ key: 'say', values: ['say'] }`.

### Dynamic options

In some cases, it is useful to create syntax elements dynamically.
This can be done by providing a function to `values` instead of an array of strings.
The function, of course, has to return an array of strings.
It gets the options as collected so far and has `this` bound properly
(unless you use an ES6 arrow function which doesn't have `this` by definition).

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

`{ key: 'is' }` in the example above is a *fix option*
which is a shorthand for `{ key: 'is', values: ['is'] }`.

### Floating elements

A phrasal function's `path` elements describe a fixed syntax, i.e., all the path elements have to be provided in exactly this order when calling the phrasal function.
In addition, you can specify floating elements which may occur optionally at any position (except the last) in the call of the phrasal function.

```javascript
const { proxy } = require('phrasal-functions');

const john = phrasal({
  fn: function (options, arg) {
    return { ...options, ...arg };
  },
  path: [
    { key: 'say', values: ['say', 'shout', 'yell', 'scream'] },
    { key: 'what', values: ['hello', 'goodbye', 'boo'] },
  ],
  floating: [
    { key: 'not' },
  ],
});

john.say.goodbye({ to: 'Joe' });
// -> { say: 'say', what: 'goodbye', to: 'Joe' }
john.not.scream.boo({ to: 'Joe' });
// -> { not: 'not', say: 'scream', what: 'boo', to: 'Joe' }
john.yell.not.hello({ to: 'Joe' });
// -> { not: 'not', say: 'yell', what: 'hello', to: 'Joe' }
```

### Async functions

`fn` can also be an `async` function returning a promise.
Consequently, use `await` when calling the phrasal function:
```javascript
const my = phrasal({
  fn: async () => Promise.resolve(...),
  ...
});
await my.phrasal.fun();
```

### Multiple paths

You can also provide multiple phrasal functions at the same time.
The first matching path wins, i.e., the first fragments decide which path is taken.

```javascript
const { phrasal } = require('phrasal-functions');

const fn = (options, ...args) => { ... };

const my = phrasal({
  fn, // could also be an extra handler just for dogs
  path: [
    { key: 'animal', values: ['dog'] },
    { key: 'is' },
    { key: 'action', values: ['barking', 'chewing', 'playing'] },
  ],
}, {
  fn, // could also be an extra handler just for cats
  path: [
    { key: 'animal', values: ['cat'] },
    { key: 'is' },
    { key: 'action', values: ['purring', 'playing'] },
  ],
});

my.dog.is.chewing();
my.cat.is.purring();
```
