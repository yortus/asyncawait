# Introduction
This node.js module brings the coding benefits of [C#'s async/await](http://msdn.microsoft.com/en-us/library/hh191443.aspx) to JavaScript. With async/await, you can eliminate the "Pyramid of Doom" and "Callback Hell" from your node.js code.

You can write any function in async/await style using the ```async``` API method. Async functions:
- may be written in a synchronous style, despite containing async operations
- always return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) representing their final return value

Within the body of an async function, use the ```await``` API method to:
- pause execution at any asynchronous expression until it returns a result
- use the return value of an asynchronous expression as if it was returned synchronously
- handle asynchronous errors using normal ```try/catch``` blocks, as if they occured synchronously
- in short, write the entire function as if it was synchronous

The ```await``` API method works out-of the box with expressions that return a promise. Also, an ```await```-friendly version of any of node.js' callback-style async functions (such as ```fs.readFile```) can be produced with the ```awaitable``` API method.

Note that 'pausing' an async function does not block node's event loop at all.

# Features and Limitations
* Completely [non-blocking](http://stackoverflow.com/a/14797359)
* Does not require [ES6 generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
* Syntax is plain JavaScript, and very close to that of C#'s async/await
* No code preprocessing or special tools, simply write and execute your code normally
* Built with [node-fibers](https://github.com/laverdet/node-fibers)
* [TypeScript](http://www.typescriptlang.org/)-friendly (since ES6 generators are not required)
* TypeScript .d.ts included
* Very tiny
* Works only on node.js, not in browsers (since it uses node-fibers)

# Installation
```
npm install asyncawait
```

# Usage Example
```javascript
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');

var longCalculation = async (function(seconds, result) {
    await (Promise.delay(seconds * 1000));
    return result;
});

var program = async (function() {
    console.log('zero...');
    var msg = await (longCalculation(1, 'one...'));
    console.log(msg);
    msg = await (longCalculation(1, 'two...'));
    console.log(msg);
    msg = await (longCalculation(1, 'three...'));
    console.log(msg);
    msg = await (longCalculation(1, 'four...'));
    console.log(msg);
});

program().then(function() {
    console.log('Finished!');
});
```

