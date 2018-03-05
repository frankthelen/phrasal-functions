# phrasal-functions

Functions with chained, fluent options.
Decorate existing objects (proxy).
Dynamic options (context-specific) and multiple paths.

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
### Decoration (Proxy)
### Dynamic options
### Fix options
### Async functions
### Multiple paths
