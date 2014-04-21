# Contents
1. [Introduction](#1-introduction)
2. [How Does it Work?](##2-how-does-it-work)
3. [Compared to...](#3-compared-to)
4. [Performance](#4-performance)
5. [Quick Start](#5-quick-start)
  * [Installation](#installation)
  * [Async/Await 101](#async-await-101)
  * [Basic Example](#basic-example)
  * [More Examples](#more-examples)
6. [Using `async` with Suspendable Functions](#6-using-async-with-suspendable-functions)
  * [Accepting Arguments and Returning Values](#accepting-arguments-and-returning-values)
  * [Handling Errors and Exceptions](#handling-errors-and-exceptions)
  * [Obtaining Results from Suspendable Functions](#obtaining-results-from-suspendable-functions)
  * [Preservation of `this` Context](#preservation-of-this-context)
  * [Creating and Using Asynchronous Iterators](#creating-and-using-asynchronous-iterators)
  * [Eager vs Lazy Execution](#eager-vs-lazy-execution)
  * [Nesting, Composition and Recursion](#nesting-composition-and-recursion)
  * [The `async.mod` Function](#the-asyncmod-function)
  

---

TODO


7. [Using `await` with Awaitable Expressions](#)
  * What Works with `await`?
  * Maximising Concurrency
  * Obtaining Promises and Thunks
  
  
8. Recipes
  * Handling HTTP Routes with Express
  * Asynchronous Testing with Mocha
  




9. [API reference](#)
10. [Feature/gotcha summary](#)


11. Acknowledgements
TODO: node-fibers, bluebird, TypeScript


12. [License](#)



# 1. Introduction
`asyncawait` addresses the problem of [callback hell](http://callbackhell.com/) in Node.js JavaScript code. Inspired by [C#'s async/await](http://msdn.microsoft.com/en-us/library/hh191443.aspx) feature, `asyncawait` enables you to write functions that **appear** to block at each asynchronous operation, waiting for the results before continuing with the following statement. For example, you can write the following in plain JavaScript:

```javascript
var foo = async (function() {
    var resultA = await (firstAsyncCall());
    var resultB = await (secondAsyncCallUsing(resultA));
    var resultC = await (thirdAsyncCallUsing(resultB));
    return doSomethingWith(resultC);
});
```

which, with one [proviso](#obtaining-promises-and-thunks), is semantically equivalent to:

```javascript
function foo2(callback) {
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

The function `foo` does not block Node's event loop, despite its synchronous appearance. Execution within `foo` is suspended during each of its three asynchronous operations, but Node's event loop can execute other code whilst those operations are pending. You can write code like the above example in a HTTP request handler, and achieve high throughput with many simultaneous connections, just like with callback-based asynchronous handlers.

In short, you can write highly concurrent code with the visual clarity and conciseness of synchronous code. Rather than using callbacks and error-backs, you can use return values and `try/catch` blocks. Rather than `require`ing specialised asynchronous control-flow constructs like [`each`](https://github.com/caolan/async#eacharr-iterator-callback) and [`whilst`](https://github.com/caolan/async#whilsttest-fn-callback), you can use plain JavaScript constructs like `for` and `while` loops.


# 2. How does it work?
Like [`co`](https://github.com/visionmedia/co), `asyncawait` can suspend a running function without blocking Node's event loop. Both libraries are built on [coroutines](http://en.wikipedia.org/wiki/Coroutine), but use different technologies. `co` uses [ES6 generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*), which work in Node >= v0.11.2 (with the `--harmony` flag), and will hopefully be supported someday by all popular JavaScript environments and toolchains.

`asyncawait` uses [`node-fibers`](https://github.com/laverdet/node-fibers). It works with plain ES3/ES5 JavaScript, which is great if your tools do not yet support ES6 generators. This may be an important consideration when using [compile-to-JavaScript languages](https://github.com/jashkenas/coffee-script/wiki/List-of-languages-that-compile-to-JS), such as [TypeScript](http://www.typescriptlang.org/) or [CoffeeScript](http://coffeescript.org/).

A similar outcome may be achieved by transforming JavaScript source code in a preprocessing step. [streamline.js](https://github.com/Sage/streamlinejs) is an example of this method. Code using `asyncawait` is executed normally without any code tranformation or preprocessing.



# 3. Compared to...
`asyncawait` represents one of several viable approaches to writing complex asynchronous code in Node.js, with its own particular trade-offs. Notable alternatives include [`async`](https://github.com/caolan/async), [`bluebird`](https://github.com/petkaantonov/bluebird/) and [`co`](https://github.com/visionmedia/co), each with their own trade-offs. The following table summarises some of the alternatives and their pros and cons. For more information about how the alternatives compare, take a look in the [comparison](./comparison) folder.

`asyncawait` may be a good choice if (a) you need highly concurrent throughput, (b) your asynchronous code must be clear and concise, (c) your code targets Node.js, and (d) you are limited to ES3/ES5 syntax (e.g. you write in TypeScript or CoffeeScript).

| | Max. throughput (full event loop utilisation) | Concise, clear code (control-flow, data-flow and error-flow) | Max. support for Node.js dev/build tools | Max. support for JS envs (eg Node + browsers)
|---|---|---|---|---|
| Plain synchronous code | :heavy_exclamation_mark:<sup>[1]</sup> | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Plain callbacks | :white_check_mark: | :heavy_exclamation_mark:<sup>[2]</sup> | :white_check_mark: | :white_check_mark: |
| Callbacks + control-flow (e.g. [`async`](https://github.com/caolan/async)) | :white_check_mark: | :heavy_exclamation_mark:<sup>[3]</sup> | :white_check_mark: | :white_check_mark: |
| Promises + control-flow (e.g. [`bluebird`](https://github.com/petkaantonov/bluebird/)) | :white_check_mark: | :heavy_exclamation_mark:<sup>[3]</sup> | :white_check_mark: | :white_check_mark: |
| Coroutines with [`co`](https://github.com/visionmedia/co) | :white_check_mark: | :white_check_mark: | :heavy_exclamation_mark:<sup>[4]</sup> | :heavy_exclamation_mark:<sup>[5]</sup> |
| Coroutines with `asyncawait` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :heavy_exclamation_mark:<sup>[6]</sup> |

**Footnotes:**
<sup>**[1]**</sup> Each synchronous call blocks Node's event loop. All concurrent tasks are blocked, and the event loop sits idle, until the call completes.
<sup>**[2]**</sup> Plain callbacks rapidly become unwieldy for complex asynchronous tasks. See [comparison](./comparison).
<sup>**[3]**</sup> Whilst better than plain callbacks, these styles still produce longer and more complex code than synchronous or coroutine-based code. See [comparison](./comparison).
<sup>**[4]**</sup> Some tools do not (yet) support ES6 generators, including [compile-to-JavaScript languages](https://github.com/jashkenas/coffee-script/wiki/List-of-languages-that-compile-to-JS) such as [TypeScript](http://www.typescriptlang.org/) and [CoffeeScript](http://coffeescript.org/).
<sup>**[5]**</sup> [ES6](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts) still has patchy browser support.
<sup>**[6]**</sup> Strictly limited to Node.js environments (i.e. no browsers) due to the use of [`node-fibers`](https://github.com/laverdet/node-fibers).



# 4. Performance
How well does `asyncawait` perform? The answer depends on what kinds of performance you care about. As a rough guide, compared with bare callbacks, expect your code to be 70% shorter with 66% less indents and run at 75.4% of the speed of bare callbacks. OK, so don't trust those numbers (which actually are [real](./comparison/README.md#comparison-summary)) but do check out the code in the [comparison](./comparison) folder, and do run your own [benchmarks](./comparison/benchmark.js).



# 5. Quick Start

### Installation
`npm install asyncawait`

### Async/Await 101
`asyncawait` provides just two functions: `async()` and `await()`. You can reference these functions with the code:
```javascript
var async = require('asyncawait/async');
var await = require('asyncawait/await');
```
Use `async` to declare a suspendable function. Inside a suspendable function, use `await` to suspend execution until an awaitable expression produces its result. Awaitable expressions typically involve performing asynchronous operations.

Note the spacing after `async` and `await` in the examples. They are just plain functions, but the space makes them look more like keywords. Alternatively if you really want them to stand out, you could use names like `__await__` or `AWAIT`, or whatever works for you.

### Basic Example
```javascript
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs')); // adds Async() versions that return promises
var path = require('path');
var _ = require('lodash');

/** Returns the number of files in the given directory. */
var countFiles = async (function (dir) {
    var files = await (fs.readdirAsync(dir));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.statAsync(path); })); // parallel!
    return _.filter(stats, function (stat) { return stat.isFile(); }).length;
});

// Give it a spin
countFiles(__dirname)
    .then (function (num) { console.log('There are ' + num + ' files in ' + __dirname); })
    .catch(function (err) { console.log('Something went wrong: ' + err); });
```

The function `countFiles` returns the number of files in a given directory. To find this number, it must perform multiple asynchronous operations (using `fs.readdir` and `fs.stat`). `countFiles` is declared as a suspendable function by wrapping its definition inside `async(...)`. When `countFiles` is called with a `dir` string, it begins executing asynchronously and immediately returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) of a result. Internally, `countFiles` appears to have synchronous control flow. Each `await` call suspends execution until its argument produces a result, which then becomes the return value of the `await` call.

### More Examples
The [examples](./examples) folder contains more examples. The [comparison](./comparison) folder also contains several examples, each coded in six different styles (using plain callbacks, using synchronous-only code, using the `async` library, using the `bluebird` library, using the `co` library, and using this `asyncawait` library). 



# 6. Using `async` with Suspendable Functions
The subsections below refer to the following code:
```javascript
var suspendable = async (function defn(a, b) {
	assert(...) // may throw
    var result = await (...)
    return result;
});
var suspendable2 = async.cps (function defn(a, b) {...});
var suspendable3 = async.thunk (function defn(a, b) {...});
var suspendable4 = async.result (function defn(a, b) {...});
```

### Accepting Arguments and Returning Values
Suspendable functions may accept arguments. Calling `suspendable(1, 2)` will in turn call `defn(1, 2)`. Suspendable functions may be variadic. They report the same arity as their definition (i.e. `suspendable.length === defn.length` returns `true` (both have arity `2`).

A suspendable function's definition may return with or without a value, or it may throw. Returning without a value is equivalent to returning `undefined`. The return value of the definition function becomes the result of the suspendable function (see [Obtaining Results from Suspendable Functions](#obtaining-results-from-suspendable-functions)). 

### Handling Errors and Exceptions
A suspendable function's definition may throw exceptions directly or indirectly. If any of the `await` calls in `defn` asynchronously produces an error result, that error will be raised as an exception inside `defn`, and will include a useable stack trace.

Within the definition of a suspendable function, exceptions may be handled using ordinary `try/catch` blocks. Any unhandled exception thrown from within `defn` will become the error result of `suspendable`.

### Obtaining Results from Suspendable Functions
A suspendable function executes asynchronously, so it cannot generally `return` its result (or `throw` an error) directly. By default, `async` produces suspendable functions that return promises. `suspendable` returns a promise that is fulfilled with `defn`'s return value, or rejected with `defn`'s exception. Other ways of communicating results/errors are also supported:

- Returning a promise: `suspendable(1, 2).then(function (val) {...}, function (err) {...});`
- Acceptng a node-style callback: `suspendable2(1, 2, function (err, val) {...});`
- returning a lazily-executed thunk: `suspendable3(1, 2)(function (err, val) {...});`
- returning the value directly: `try { var val = suspendable4(1, 2); } catch (err) {...}`

Note that `suspendable4` can only be called from inside another suspendable function. Also, it is possible to create suspendable functions that comminucate results in multiple ways, such as both accepting a callback and returning a promise. You can use the [`async.mod`](#the-asyncmod-function) ***TODO check link *** function to achieve this.

### Preservation of `this` Context
When a suspendable function is called, its `this` context is passed through to the call to its definition. For example, when `suspendable.call(myObj, 1, 2)` is executed, `defn` will be called with arguments `1` and `2` and a `this` value of `myObj`.

### Creating and Using Asynchronous Iterators
The `async` function can be used to create asynchronous iterators. These are analogous to [ES6 iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol), except that the `next()` function is a suspendable function obeying all the rules described in this section. `async.iterable` creates an iterable which returns an asynchronous iterator whose `next()` function returns a promise of a `{value, done}` result.

Asynchronous iterators have a `forEach()` method for iterating over their values, and a `stream()` method for returning all their values as a stream. For more information, take a look at the [descendentFilePaths.js](./examples/descendentFilePaths.js) and [iteration.js](./examples/iteration.js) examples. ***TODO check link ***

### Eager vs Lazy Execution
Calling a suspendable function such as `suspendable` starts its asynchronous execution immediately, as per the normal semantics of promises. In contrast, thunk-returning suspendable functions do not begin executing until a callback is passed to the thunk. Suspendable functions such as `suspendable3` thus have lazy semantics.

### Nesting, Composition and Recursion
Suspendable functions may be called in `await` expressions, since they return promises (or thunks or values) and are therefore [awaitable](#what-works-with-await). It follows that calls to suspendable functions may be arbitrarily nested and composed, and may be recursive.

### The `async.mod` Function
Every variant of the `async` function (i.e. `async`, `async.cps`, `async.iterable`, etc) has a `mod` method that accepts an `options` object and returns another `async` function variant. The `options` object may contain any combination of the following four properties:

```javascript
{
    returnValue: <string>; // Recognised values: 'none', 'promise', 'thunk', 'result'
    acceptsCallback: <boolean>;
    isIterable: <boolean>;
    maxConcurrency: <number>; // Recognised values: falsy values and positive numbers
}
```
Omitted properties will inherit their value from the `async` variant being modded. For example, the calls `async.mod({acceptsCallback:true})` and `async.cps.mod({returnValue:'promise'})` are equivalent. Both calls return an `async` function that may be used to create suspendable functions that both accept a callback and return a promise.



# 7. Using `await` with Awaitable Expressions

### What Works with `await`?
### Maximising Concurrency
### Obtaining Promises and Thunks
  
  
# 8. Recipes
### Handling HTTP Routes with Express
### Asynchronous Testing with Mocha
  





# What Works with `await`?
`await` takes a single argument, which can be any of the following (the so-called **awaitables**):

- A [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (or any `then`-able object). The function will suspend until the promise is settled. The promise's resolution value will become `await`'s return value. If the promise is rejected, `await` will raise an exception inside the function with the rejection value.
- A [thunk](https://github.com/visionmedia/co#thunks-vs-promises). The thunk's result will become `await`'s return value. If the thunk returns an error, `await` will raise an exception inside the function with the error value.
- A simple value, such as a number, string or null. `await` will return immediately with the value.
- An array or [plain object](http://lodash.com/docs#isPlainObject), whose elements are all awaitables. Note this definition is recursive and allows nested object graphs. The function will suspend until all nested awaitables have produced their value, at which time `await` will return with a clone of the object graph with all promises and thunks replaced by their results. If any promise is rejected or any thunk returns an error, then `await` will raise an exception inside the function with the rejection or error value.



# 8. Additional Coding Tips

### Accepting Arguments and Returning Values
Suspendable functions may accept arguments, return with or without a value, and throw exceptions just like ordinary functions. When a `return` statement is executed, the function's promise is resolved with the return value (which will be `undefined` if it is an expression-less `return`).

### Handling Errors and Exceptions
Within suspendable functions, errors may be handled using ordinary `try/catch` blocks. This includes asynchronous errors that originate from any of the `await` operations. The exception object will also contain a useable stack trace. If a suspendable function has no error-handling logic, and an error occurs during execution (or an exception is explicitly thrown by the function), then the function's promise will be rejected with the exception value.

### Nesting and Composing Suspendable Functions
Suspendable functions may be called in `await` expressions, since they return promises and are therefore [awaitable](#what-works-with-await). It follows that calls to suspendable functions may be arbitrarily nested and composed, and may be recursive.

### Maximising concurrency
You can execute any number of asynchronous operations concurrently by applying `await` to an array of awaitable expressions. `await` will return the array of results when all the concurrent operations are complete, or throw if any of them fail. Libraries like [lodash](http://lodash.com) and [underscore](http://underscorejs.org/) make this very succinct.

### Obtaining Promises and Thunks
In conventional Node.js code, asynchronous functions take a callback as their last parameter and don't return any value. As such, calls to these functions are **not** [awaitable](#what-works-with-await). However, awaitable versions may be obtained with relative ease using something like [`bluebird's`](https://github.com/petkaantonov/bluebird/) [`promisifyAll()`](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisepromisifyallobject-target---object), or [`thunkify`](https://github.com/visionmedia/node-thunkify).

### Developing in TypeScript
`asyncawait` is written in TypeScript (look in the [src folder](./src)), and includes a [type definition file](./asyncawait.d.ts). Go nuts!



# API Reference

### `function async(fn: Function) --> (...args) --> Promise`
Creates a function that can be suspended at each asynchronous operation. `fn` contains the body of the suspendable function. `async` returns a function of the form `(...args) --> Promise`. Any arguments passed to this function are passed through to `fn`. The returned promise is resolved when `fn` returns, or rejected if `fn` throws.

### `function await(expr: Awaitable) --> Any`
Suspends an `async`-wrapped function until the [awaitable](#what-works-with-await) expression `expr` produces a result. The result becomes the return value of the `await` call. If `expr` produces an error, then an exception is raised in the `async`-wrapped function.



# Feature/Gotcha Summary
* Reduces length and complexity of asynchronous code
* [Fast](./comparison) and lightweight
* Completely [non-blocking](http://stackoverflow.com/a/14797359)
* Does not require [ES6 generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
* Syntax is plain JavaScript, and behaves much like C#'s async/await
* Seamless interoperation with libraries that consume and/or produce promises
* No code preprocessing or special tools, simply write and execute your code normally
* Built with [node-fibers](https://github.com/laverdet/node-fibers)
* [TypeScript](http://www.typescriptlang.org/) and X-to-JavaScript friendly (since ES6 generators are not required)
* TypeScript .d.ts included
* Works only on node.js, not in browsers (since it uses node-fibers)



# Acknowledgements
TODO...



# License
Copyright (c) 2014 Troy Gerwien

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
