# 0.7.2 (2014-06-17)

#### Bug Fixes

 - Workaround problem if multiple node-fibers instances in process ([more info](./src/fibers.ts)).

# 0.7.1 (2014-04-22)

#### Bug Fixes

 - Added missing files to root folder (`require('asyncawait/async')` was failing)

# 0.7.0 (2014-04-21)

#### New Features

 - Suspendable functions can accept node-style callbacks (`async.cps`)
 - Suspendable functions can return a thunk (`async.thunk`)
 - Suspendable function can await and return their result directly (`async.result`)
 - Suspendable functions can yield multiple values (`async.iterable`)
 - Custom `async` functions can be created by modding existing `async` functions (`async.mod`)
 - `await` supports a variant equivalent to bluebird's `race()` (`await.top(n)`)
 - `await` supports a variant that reuses existing arrays/objects (`await.in`)

#### Improvements

 - Suspendable functions have the same arity (i.e. `function.length`) as their definition
 - benchmark.js supports a configurable concurrency factor
 - benchmark.js supports optionally mocking the `fs` module
 - benchmark.js provides more GC details
 - Various optimisations for heavy concurrent loads
 - Added bluebird to comparisons
 - Added fibonacci function to comparisons
 - Added automatic management of fiber pool size

#### Bug Fixes

 - fixed memory leak under heavy concurrent loads (see this [node-fibers issue](https://github.com/laverdet/node-fibers/issues/169))

# 0.6.1 (2014-03-28)

No changes logged for this or prior versions.
