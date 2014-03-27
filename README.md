# Introduction
`asyncawait` provides Yet Another Way™ to tame [callback hell](http://callbackhell.com/) in Node.js applications. Inspired by [C#'s async/await](http://msdn.microsoft.com/en-us/library/hh191443.aspx) feature, `asyncawait` enables you to write functions that **appear** to block at each asynchronous operation, waiting for the results before continuing with the following statement. For example, you can write the following in plain JavaScript:

```javascript
var foo = async (function() {
    var resultA = await (firstAsyncCall());
    var resultB = await (secondAsyncCallUsing(resultA));
    var resultC = await (thirdAsyncCallUsing(resultB));
    return (doSomethingWith(resultC));
});
```

which, with one [proviso](./README.md#what-works-with-await), is semantically equivalent to:

```javascript
function foo(callback) {
    firstAsyncCall(function (err, resultA) {
        if (err) { callback(err); return; }
        secondAsyncCallUsing(resultA, function (err, resultB) {
            if (err) { callback(err); return; }
            thirdAsyncCallUsing(resultB, function (err, resultC) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, doSomethingWith(resultC));
                }
            });

        });
    });
}
```

The above function does not block node's event loop, despite its synchronous appearance. Execution within the function is suspended during each asynchronous operation, but node's event loop is free to do other things with that time. You could write code like the above example in a HTTP request handler, and achieve high throughput with many simultaneous connections, just like with callback-based asynchronous handlers.

# What about the Alternatives?
`asyncawait` represents one of several viable approaches to taming callback-heavy code in Node.js, with its own particular trade-offs. Notable alternatives are [`async`](https://github.com/caolan/async) and [`co`](https://github.com/visionmedia/co), which have their own trade-offs. For more information about how the alternatives compare, take a look in the [comparison](./comparison) folder.

`asyncawait` may suit you if:

1. your application involves complex operations but must exploit maximum parallelism;
2. your tooling does not support [ES6](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts), for example because you use a compile-to-JavaScript language like [TypeScript](http://www.typescriptlang.org/) or [CoffeeScript](http://coffeescript.org/);
3. you prefer your code to be as short and simple as it's synchronous/blocking equivalent; and
4. your application runs in Node.js (eg your are writing a web server or some other server-side program).

**#1** rules out simple synchronous code (eg `fs.readFileSync()` and the like). **#2** rules out `co`. **#3** rules out plain callbacks and `async`. If **#4** is a deal-breaker, your best option might be `async`. `asyncawait` will not work in browsers due to its reliance on [`node-fibers`](https://github.com/laverdet/node-fibers). `co` uses [ES6 generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*), making it unsuitable for general browser-based apps for some time to come.

# How does `asyncawait` work?
`asyncawait`, like `co`, can suspend a running function without blocking the thread. Both libraries are based on the same concept (the [coroutine](http://en.wikipedia.org/wiki/Coroutine)), but different technologies. `co` uses ES6 generators, which work in node >= v0.11.2 (with the `--harmony` flag), and will hopefully be supported someday by all popular JavaScript environments and tool-chains. `asyncawait` is built on [`node-fibers`](https://github.com/laverdet/node-fibers) and works with plain ES3/ES5 JavaScript, which is great if your tools bork at ES6 generators.

# How is the Performance?
It depends what you care about when you say performance. As a rough guide, compared with bare callbacks, expect your code to be 68.92% shorter with 70% less indents and run at 73% of the speed of bare callbacks. OK, so don't trust those numbers but do check out the code in the [comparison folder](./comparison), and do run your own [benchmarks](./comparison/benchmark.js).

# Installation
`npm install asyncawait`

# How to Use
`asyncawait` provides just two functions: `async()` and `await()`. You can reference these functions with the code:
```javascript
var async = require('asyncawait/async');
var await = require('asyncawait/await');
```

To write a function that can be suspended async/await-style, wrap the definition inside `async(...)`. The call to `async` returns a function (`countFiles` in the example below). When `countFiles` is called, any arguments are passed through to the function wrapped by `async(...)` (in this case a path string), and `countFiles` immediately returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Here is the example:

```javascript
var async = require('../async');
var await = require('../await');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');


var countFiles = async (function(dir) {
    var files = await (fs.readdirSync(dir));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.statAsync(path); }));
    return _.filter(stats, function (stat) { return stat.isFile(); }).length;
});


countFiles(__dirname).then(function (n) {
    console.log('There are ' + n + ' files in ' + __dirname);
});
```

Note the spacing after `async` and `await`. They are just plain functions, but the space makes them look more like operators. Alternatively if you really want them to stand out, you could define them like `__await__` or `AWAIT` or use whatever style works for you.

# What Works with `await`?
`await` takes a single argument, which can be any of the following (the so-called 'awaitables'):

- A `then`-able object or promise. The function will suspend until the promise is settled. The promise's resolution value will become `await`'s return value. If the promise is rejected, `await` will raise an exception inside the function with the rejection value.
- A [thunk](https://github.com/visionmedia/co#thunks-vs-promises). The thunk's result will become `await`'s return value. If the thunk returns an error, `await` will raise an exception inside the function with the error value.
- A simple value, such as a number, string or null. `await` will return immediately with the value.
- An array or [plain object](https://github.com/jeffomatic/deep#isplainobjectobject), whose elements are all awaitables. Note this definition allows deep object graphs. The function will suspend until all awaitables have produced their value, at which time `await` will return with a clone of the object graph with all promises and thunks replaced by their results. If any promise is rejected or any thunk returns an error, then `await` will raise an exception inside the function with the rejection or error value.


# Additional Considerations
### Handling Errors and Exceptions


### Nesting and Composing Asynchronous Functions


### Obtaining Promises and Thunks





# Feature/Gotcha Summary
- Reduces length and complexity of asynchronous code
- Does not block
- Uses plain ES3/ES5 JavaScript. ES6 generators not required
- No preprocessing
- TypeScript-friendly and X-to-JavaScript-friendly
- Uses node-fibers
- Performant
- .d.ts provided




# Awaitables
- Promises (incl calls to other async functions - compoosable)
- Thunks
- Object/Array graphs
- Simple values

How to await node functions...





# TypeScript
- also, fix Thunk interface in .d.ts (both params optional)


# Further Examples


# API reference
- no more awaitable()! Use promisify/thunkify/denodeify

- options:
```
async.options(default: 'promise');
var fn = async.thunk (function() {
    ...
    ...
});
var fn = async.node (function() {
    ...
    ...
});
```


# License
MIT

















# Introduction
This node.js module brings the coding benefits of [C#'s async/await](http://msdn.microsoft.com/en-us/library/hh191443.aspx) to JavaScript. With async/await, you can eliminate the "Pyramid of Doom" and "Callback Hell" from your node.js code.

You can write any function in async/await style using the ```async``` API function. Async functions:
- may be written in a synchronous style, despite containing asynchronous operations
- always return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) representing their final return value

Within the body of an async function, use the ```await``` API function to:
- pause execution at any asynchronous expression until it returns a result
- use the return value of an asynchronous expression as if it was returned synchronously
- handle asynchronous errors using normal ```try/catch``` blocks, as if they occured synchronously
- in short, write the entire function as if it was synchronous

The ```await``` API function works out-of the box with expressions that return a promise. Also, an ```await```-friendly version of any of node.js' callback-style async functions (such as ```fs.readFile```) can be produced with the ```awaitable``` API function.

Note that 'pausing' an async function does not block node's event loop at all.

# Features and Limitations
* Completely [non-blocking](http://stackoverflow.com/a/14797359)
* Does not require [ES6 generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
* Syntax is plain JavaScript, and very close to that of C#'s async/await
* Seamless interoperation with libraries that consume and/or produce promises
* No code preprocessing or special tools, simply write and execute your code normally
* Built with [node-fibers](https://github.com/laverdet/node-fibers)
* [TypeScript](http://www.typescriptlang.org/)-friendly (since ES6 generators are not required)
* TypeScript .d.ts included
* Very tiny
* Works only on node.js, not in browsers (since it uses node-fibers)

# Installation
### via npm
- `npm install asyncawait`

### from source
- `git clone git://github.com/yortus/node-async-await.git asyncawait`
- `cd asyncawait`
- `npm install`

# Example 1: Basics
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

# Example 2: Interleaved/Non-blocking
```javascript
var fs = require('fs');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

// A slow asynchronous function, written in async/await style
var longCalculation = async (function(seconds, result) {
    await(Promise.delay(seconds * 1000));
    return result;
});

// A pair of synchronous-looking compound operations, written in async/await style
var compoundOperationA = async (function() {
    console.log('A: zero');
    console.log(await (longCalculation(1, 'A: one')));
    console.log(await (longCalculation(1, 'A: two')));
    console.log(await (longCalculation(1, 'A: three')));
    return 'A: Finished!';
});
var compoundOperationB = async (function() {
    await (longCalculation(0.5)); // Fall half a second behind A
    console.log('B: zero');
    console.log(await (longCalculation(1, 'B: one')));
    console.log(await (longCalculation(1, 'B: two')));
    console.log(await (longCalculation(1, 'B: three')));
    return 'B: Finished!';
});

// Start both compound operations
compoundOperationA().then(function(result) { console.log(result); });
compoundOperationB().then(function(result) { console.log(result); });
```

Outputs (with half second delays between lines):
```
A: zero
B: zero
A: one
B: one
A: two
B: two
A: three
A: Finished!
B: three
B: Finished!
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
