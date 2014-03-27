# Comparing Alternative Approaches



### The Setup
In this folder are five files called `largest-*.js`. They each contain fairly equivalent code to implement the function described below. The five alternative approaches considered are:

* ['largest-callbacks.js'](./largest-callbacks.js) uses plain old callbacks
* ['largest-async.js'](./largest-async.js): uses the [`async`](https://github.com/caolan/async) library
* ['largest-co.js'](./largest-co.js): uses the [`co`](https://github.com/visionmedia/co) library (requires node >= 0.11.2 with the `--harmony` flag)
* ['largest-asyncawait.js'](./largest-asyncawait.js): uses `asyncawait`
* ['largest-synchronous.js'](./largest-synchronous.js): uses purely blocking code (just for comparison)



### The Example Function
The example function is called `largest()` and is designed to be of moderate complexity, like a real-world problem.

`largest(dir, options)` finds the largest file in the given directory, optionally performing a recursive search. `dir` is the path of the directory to search. `options`, if provided, is a hash with the following two keys, both optional:

* `recurse` (`boolean`, defaults to `false`): if true, `largest()` will recursively search all subdirectories.
* `preview` (`boolean`, defaults to `false`): if true, `largest()` will include a small amount of the largest file's content in it's results.

The requirements of `largest()` may be summarised as:

1. Find the largest file in the given directory (recursively searching subdirectories if the option is selected)
2. Keep track of how many files/directories have been processed
3. Get a preview of the file contents (first several characters) if the option is selected
4. Return the details about the largest file and the number of files/directories searched
5. Exploit parallelism wherever possible
6. Don't block anywhere



### Metrics for Comparison
Some interesting metrics with which to compare the five alternatives are:

* **Lines of code (SLOC)**: Shorter code that does the same thing is usually a good thing
* **Levels of Indenting**: Each indent represents a context-switch and therefore higher complexity
* **Anachrony**: Asynchronous code may execute in an order very different from its visual representation, which may make it harder to read and reason about in some cases
* **Speed**: Node.js is built for speed and throughput, so any loss of speed imposed by an approach may count against it 


# Comparison Summary

| Approach      | SLOC [1] | Indents [2] | Anachrony [3] | Ops/sec [4] |
| ------------- | -------- | ----------- | ------------- | ----------- |
| callbacks     |       74 |           7 |             8 |    ~304     |
| async         |       64 |           7 |             6 |    ~256     |
| co            |       23 |           2 |             - |    ~215 [5] |
| asyncawait    |       23 |           2 |             - |    ~221     |
| synchronous   |       23 |           2 |             - |    ~189 [6] |

###### Footnotes:

[1] Includes only the body of `largest()`; excludes blank lines and comment lines.

[2] Maximum indentation from the outermost statements in the body of `largest()`.

[3] Count of times in body of `largest()` when visually lower statements execute before visually higher statements due to asynchronous callbacks.

[4] Using [benchmark.js](./benchmark.js) on my old laptop. All running node v0.10.25 except for `co` - see [5] below.

[5] `co` benchmark run with node v0.11.12 `--harmony`.

[6] Benchmark throws stack overflow after a few runs. Also, not really comparable because it's blocking.



# Observations
The following observations are based on the above results and obviously may differ substantially with other code and/or on other machines. YMMV. Having said that, at least in this case:

* Plain callbacks are the speed king.
* The synchronous approach is actually the slowest, which perhaps makes sense since it can't exploit parallellism.
* The source code of `co`, `asyncawait`, and `synchronous` are virtually identical, with purely mechanical syntax differences.
* `co` and `asyncawait`, each using different coroutine technology, are virtually identical on all metrics. In a choice between these two, the biggest deciding factor may be whether you can use ES6.
* `co` and `asyncawait` achieve about 70% of the performance of plain callbacks.
* `async` is somewhat faster than `co` and `asyncawait`, but compares less favourably on other metrics.
