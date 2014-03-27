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

which, with one [proviso](#obtaining-promises-and-thunks), is semantically equivalent to:

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
4. your application runs in Node.js (eg a web server or some other server-side program).

**#1** rules out simple synchronous code (eg `fs.readFileSync()` and the like). **#2** rules out `co`. **#3** rules out plain callbacks and `async`. If **#4** is a deal-breaker, your best option might be `async`. `asyncawait` will not work in browsers due to its reliance on [`node-fibers`](https://github.com/laverdet/node-fibers). `co` uses [ES6 generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*), making it unsuitable for general browser-based apps for some time to come.



# How does `asyncawait` work?
`asyncawait`, like `co`, can suspend a running function without blocking the thread. Both libraries are based on the same concept (the [coroutine](http://en.wikipedia.org/wiki/Coroutine)), but different technologies. `co` uses ES6 generators, which work in node >= v0.11.2 (with the `--harmony` flag), and will hopefully be supported someday by all popular JavaScript environments and tool-chains. `asyncawait` is built on [`node-fibers`](https://github.com/laverdet/node-fibers) and works with plain ES3/ES5 JavaScript, which is great if your tools bork at ES6 generators.



# How is the Performance?
It depends what you care about when you say performance. As a rough guide, compared with bare callbacks, expect your code to be 68.92% shorter with 70% less indents and run at 73% of the speed of bare callbacks. OK, so don't trust those numbers (which actually are [real](./comparison/README.md#comparison-summary)) but do check out the code in the [comparison folder](./comparison), and do run your own [benchmarks](./comparison/benchmark.js).



# Installation
`npm install asyncawait`



# How to Use
`asyncawait` provides just two functions: `async()` and `await()`. You can reference these functions with the code:
```javascript
var async = require('asyncawait/async');
var await = require('asyncawait/await');
```

To write a function that can be suspended async/await-style, wrap the definition inside `async(...)`. The call to `async` returns a function -- called `countFiles` in the example below. When `countFiles` is called, any arguments are passed through to the function wrapped by `async(...)` (in this case a path string), and `countFiles` immediately returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Here is the example:

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


countFiles(__dirname)
    .then (function (num) { console.log('There are ' + num + ' files in ' + __dirname); })
    .catch(function (err) { console.log('Something went wrong: ' + err); });
```

Note the spacing after `async` and `await`. They are just plain functions, but the space makes them look more like operators. Alternatively if you really want them to stand out, you could define them like `__await__` or `AWAIT` or use whatever style works for you.



# What Works with `await`?
`await` takes a single argument, which can be any of the following (the so-called **awaitables**):

- A [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (or any `then`-able object). The function will suspend until the promise is settled. The promise's resolution value will become `await`'s return value. If the promise is rejected, `await` will raise an exception inside the function with the rejection value.
- A [thunk](https://github.com/visionmedia/co#thunks-vs-promises). The thunk's result will become `await`'s return value. If the thunk returns an error, `await` will raise an exception inside the function with the error value.
- A simple value, such as a number, string or null. `await` will return immediately with the value.
- An array or [plain object](https://github.com/jeffomatic/deep#isplainobjectobject), whose elements are all awaitables. Note this definition is recursive and allows nested object graphs. The function will suspend until all nested awaitables have produced their value, at which time `await` will return with a clone of the object graph with all promises and thunks replaced by their results. If any promise is rejected or any thunk returns an error, then `await` will raise an exception inside the function with the rejection or error value.



# Additional Coding Considerations
### Parameters and Return values
`async`-wrapped functions may accept arguments, return with or without a value, and throw exceptions just like ordinary functions. When a `return` statement is executed, the function's promise is resolved with the return value (which will be `undefined` if it is an expression-less `return`).

### Handling Errors and Exceptions
Within `async`-wrapped functions, errors may be handled using ordinary `try/catch` blocks. This includes asynchronous errors that originate from any of the `await` operations. The exception object should also contain a useable stack trace. If an `async`-wrapped function has no error-handling logic, and an error occurs during execution (or an exception is explicitly thrown by the function), then the function's promise will be rejected with the exception value.

### Nesting and Composing Asynchronous Functions
`async`-wrapped functions may be used as `await` expressions, since they return promises and are therefore [awaitable](#what-works-with-await). It follows that calls to `async`-wrapped functions may be arbitrarily nested and composed, and may be recursive.

### Obtaining Promises and Thunks
In conventional Node.js code, asynchronous functions take a callback as their last parameter and don't return any value. As such, calls to these functions are **not** [awaitable](#what-works-with-await). However, awaitable versions may be easily obtained using something like [`bluebird's`](https://github.com/petkaantonov/bluebird/) [`promisifyAll()`](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisepromisifyallobject-target---object), or [`thunkify`](https://github.com/visionmedia/node-thunkify).

### Developing in TypeScript
`asyncawait` is written in TypeScript (look in the [src folder](./src)), and includes a [type definition file](./asyncawait.d.ts). Go nuts!



# Feature/Gotcha Summary
* Reduces length and complexity of asynchronous code
* Completely [non-blocking](http://stackoverflow.com/a/14797359)
* Does not require [ES6 generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
* Syntax is plain JavaScript, and behaves much like C#'s async/await
* Seamless interoperation with libraries that consume and/or produce promises
* No code preprocessing or special tools, simply write and execute your code normally
* Has decent [performance](./comparison)
* Built with [node-fibers](https://github.com/laverdet/node-fibers)
* [TypeScript](http://www.typescriptlang.org/)-friendly (since ES6 generators are not required)
* TypeScript .d.ts included
* Works only on node.js, not in browsers (since it uses node-fibers)



# API Reference
### `function async(fn: Function) --> (...args) --> Promise`
Creates a function that can be suspended at each asynchronous operation. `fn` contains the body of the suspendable function. `async` returns a function of the form `(...args) --> Promise`. Any arguments passed to this function are passed through to `fn`. The promise is resolved when `fn` returns, or rejected if `fn` throws.

### `function await(expr: Awaitable) --> Any`
Suspends an `async`-wrapped function until the [awaitable](#what-works-with-await) expression `expr` produces a result. The result becomes the return value of the `await` call. Alternatively, if `expr` produces an error, then an exception is raised in the `async`-wrapped function.



# License
Copyright (c) 2014 Troy Gerwien

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
