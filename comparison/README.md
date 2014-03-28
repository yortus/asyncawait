# Comparing Node.js Asynchronous Alternatives



### The Example Functions
The `largest` and `countFiles` folders each contain a sample function implemented in five different ways:
* **callbacks**: using plain old callbacks;
* **async**: using the [`async`](https://github.com/caolan/async) library;
* **co**: using the [`co`](https://github.com/visionmedia/co) library (requires node >= 0.11.2 with the `--harmony` flag);
* **asyncawait**: using this `asyncawait` library; and
* **synchronous**: using purely blocking code (just for comparison).

This gives a good indication of the trade-offs between the different coding styles. For the remainer of this document, we'll focus on the more complex of the two exmaples, the `largest()` function.



### The `largest()` Function
The `largest()` example function is designed to be of moderate complexity, like a real-world problem.

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
* **Levels of Indenting**: Each indent represents a context-shift and therefore higher complexity
* **Anachrony**: Asynchronous code may execute in an order very different from its visual representation, which may make it harder to read and reason about in some cases
* **Speed**: Node.js is built for speed and throughput, so any loss of speed imposed by an approach may count against it 


# Comparison Summary
The following metrics are for the `largest()` example function:

| Approach      | SLOC [1] | Indents [2] | Anachrony [3] | Ops/sec [4] |
| ------------- | -------- | ----------- | ------------- | ----------- |
| callbacks     |       85 |           6 |             9 |    ~248     |
| async         |       70 |           7 |             5 |    ~147     |
| co            |       23 |           2 |             - |    ~182 [5] |
| asyncawait    |       23 |           2 |             - |    ~187     |
| synchronous   |       23 |           2 |             - |    ~157 [6] |

###### Footnotes:

[1] Includes only lines in the function body; excludes blank lines and comment lines.

[2] Maximum indentation from the outermost statements in the function body.

[3] Count of times in the function body when visually lower statements execute before visually higher statements due to asynchronous callbacks.

[4] Using [benchmark.js](./benchmark.js) on my laptop. All running node v0.10.25 except for `co` - see [5] below.

[5] `co` benchmark run with node v0.11.12 `--harmony`.

[6] Benchmark throws stack overflow after a few runs. Also, not really comparable because it's blocking.



# Observations
The following observations are based on the above results and obviously may differ substantially with other code and/or on other machines. **YMMV**. Having said that, at least in this case:

* Plain callbacks are the speed king.
* `asyncawait` is second-fastest in this benchmark, achieving about 75% of the performance of plain callbacks.
* The source code of `co`, `asyncawait`, and `synchronous` are virtually identical, with purely mechanical syntax differences.
* `co` and `asyncawait`, each using different coroutine technology, are virtually identical on all metrics. In a choice between these two, the biggest deciding factor may be whether you can use ES6.
* The synchronous approach is actually one of the slowest, which perhaps makes sense since it can't exploit parallellism.
* `async` is slowest in this benchmark, and also looks relatively unfavourable on the other metrics.
