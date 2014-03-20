# Introduction
This node.js module brings the coding benefits of [C#'s async/await](http://msdn.microsoft.com/en-us/library/hh191443.aspx) to JavaScript. With async/await, you can eliminate the "Pyramid of Doom" and "Callback Hell" from your node.js code.

You can write any function in async/await style using the ```async``` API method. Async functions:
- may be written in a synchronous style, despite containing asynchronous operations
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
var fs = require('fs');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var awaitable = require('asyncawait/awaitable');

// A function that returns a promise
function delay(milliseconds) {
    return Promise.delay(milliseconds);
}

// An await-friendly version of fs.readFile
var readFile = awaitable(fs.readFile);

// A slow asynchronous function, written in async/await style
var longCalculation = async (function(seconds, result) {
    await (delay(seconds * 1000));
    return result;
});

// Another synchronous-looking function written in async/await style...
var program = async (function() {
    try  {
        console.log('zero...');

        var msg = await (longCalculation(1, 'one...'));
        console.log(msg);

        msg = await (longCalculation(1, 'two...'));
        console.log(msg);

        msg = await (longCalculation(1, 'three...'));
        console.log(msg);

        var file = await (readFile('NonExistingFilename'));

        msg = await (longCalculation(1, 'four...'));
        console.log(msg);
    } catch (ex) {
        console.log('Caught an error');
    }
    return 'Finished!';
});

program().then(function(result) {
    console.log(result);
});
```

Outputs (with one second delays between the numbers):
```
zero...
one...
two...
three...
Caught an error
Finished!
```

# API Reference

### ```function async(fn) {...}```

**```fn```**: a function written in async/await style (ie using the ```await``` API method)

**returns**: a function that executes ```fn``` and return a promise of ```fn```'s results

**remarks**: any arguments are passed through to fn

### ```function await(expr) {...}```

**```expr```**: any 'thenable' expression (ie a promise)

**returns**: the eventual value of ```expr```'s promise (or throws if the promise is rejected)

**remarks**: suspends execution of the function in which ```await``` appears, until ```expr```'s promise is resolved

### ```function awaitable(fn) {...}```

**```fn```**: a node-style asynchronous function (ie a function which takes a ```callback(err,val){...}``` as final argument)

**returns**: a function that executes ```fn``` and return a promise of ```fn```'s results

**remarks**: this is essentially the same as the ```denodeify```/```promisify``` helper functions of promise libraries

# License
The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


