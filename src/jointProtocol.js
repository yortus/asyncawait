var Fiber = require('fibers');
var _ = require('./util');


/**
*  A hash of functions and properties that are used internally at various
*  stages of async/await handling. The jointProtocol may be augmented by mods,
*  which are loaded via the use(...) API method.
*/
var jointProtocol = {
    // The following methods comprise the overridable part of the jointProtocol API.
    acquireFiber: null,
    releaseFiber: null,
    createFiberBody: null,
    // The remaining items are for internal use and may not be overriden.
    currentFiber: function () {
        return Fiber.current;
    },
    suspendFiber: function (val) {
        return Fiber.yield(val);
    },
    isCurrent: function (fi) {
        var f = Fiber.current;
        return f && f.id === fi.id;
    },
    nextCoroId: 1,
    continueAfterYield: {},
    notHandled: {},
    restoreDefaults: function () {
        return _.mergeProps(jointProtocol, defaultProtocol);
    },
    //TODO: temp testing... needed to move it to avoid circular ref cpsKeyword->cps->awaitBuilder->extensibility->cpsKeyword
    continuation: function continuation() {
        var fi = jointProtocol.currentFiber();
        var i = fi.awaiting.length++;
        return function continue_(err, result) {
            fi.awaiting[i](err, result);
            fi = null;
        };
    }
};

/** Default implementations for the overrideable jointProtocol methods. */
var defaultProtocol = {
    /** Create and return a new Fiber instance. */
    acquireFiber: function (asyncProtocol, bodyFunc, bodyThis, bodyArgs) {
        var fiberBody = jointProtocol.createFiberBody(asyncProtocol, function getFi() {
            return fi;
        });
        var fi = Fiber(fiberBody);
        fi.id = ++jointProtocol.nextCoroId;
        fi.bodyFunc = bodyFunc;
        fi.bodyThis = bodyThis;
        fi.bodyArgs = bodyArgs;
        fi.context = {};
        fi.awaiting = [];
        fi.suspend = function (error, value) {
            return asyncProtocol.suspend(fi, error, value);
        };
        fi.resume = function (error, value) {
            return asyncProtocol.resume(fi, error, value);
        };
        return fi;
    },
    /** Ensure the Fiber instance is disposed of cleanly. */
    releaseFiber: function (asyncProtocol, fi) {
        fi.suspend = null;
        fi.resume = null;
        fi.context = null;
        fi.bodyFunc = null;
        fi.bodyThis = null;
        fi.bodyArgs = null;
    },
    /** Create the body function to be executed inside a fiber. */
    createFiberBody: function (asyncProtocol, getFi) {
        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared below.
        function fiberBody() {
            try  {
                tryBlock();
            } catch (err) {
                catchBlock(err);
            } finally {
                setImmediate(finallyBlock); /* Ensure the fiber exits before we clean it up. */ 
            }
        }

        // These references are shared by the closures below.
        var fi, result, error;

        // Define the details of the body function's try/catch/finally clauses.
        function tryBlock() {
            // Lazy-load the fiber instance to use throughout the body function. This mechanism
            // means that the instance need not be available at the time createFiberBody() is called.
            fi = fi || getFi();

            // Clear the error state.
            error = null;

            // Execute the entirety of bodyFunc, using the fastest feasible invocation approach.
            var f = fi.bodyFunc, t = fi.bodyThis, a = fi.bodyArgs, noThis = !t || t === global;
            if (noThis && a) {
                switch (a.length) {
                    case 0:
                        result = f();
                        break;
                    case 1:
                        result = f(a[0]);
                        break;
                    case 2:
                        result = f(a[0], a[1]);
                        break;
                    default:
                        result = f.apply(null, a);
                }
            } else {
                result = !noThis ? f.apply(t, a) : f();
            }
        }
        function catchBlock(err) {
            error = err;
        }
        function finallyBlock() {
            asyncProtocol.end(fi, error, result);
            jointProtocol.releaseFiber(asyncProtocol, fi);
        }

        // Return the completed fiberBody closure.
        return fiberBody;
    }
};
module.exports = jointProtocol;
//# sourceMappingURL=jointProtocol.js.map
