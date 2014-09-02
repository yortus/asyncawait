var Fiber = require('fibers');
var fiberProtocol = require('../fiberProtocol');


/** Provides the baseline method implementations for the joint protocol. */
var mod = {
    name: 'fiber.base',
    base: '',
    override: function (base, options) {
        return ({
            /** Create and return a new Fiber instance. */
            acquire: function (asyncProtocol) {
                var fi = createFiber(asyncProtocol);
                fi.id = ++nextFiberId;
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
            release: function (asyncProtocol, fi) {
                fiberProtocol.retarget(fi, null);
                fi.suspend = null;
                fi.resume = null;
                fi.context = null;
                fi.awaiting = null; //TODO: finalise this...
            },
            //TODO: comment...
            retarget: function (fi, bodyFunc, bodyThis, bodyArgs) {
                fi.bodyFunc = bodyFunc;
                fi.bodyThis = bodyThis;
                fi.bodyArgs = bodyArgs;
            }
        });
    },
    defaults: {}
};

/** Holds the id number to be assigned to the next new fiber. Every fiber gets a different id. */
var nextFiberId = 0;

/** Create a new fiber with a body function that is adapted to the given async protocol. */
function createFiber(asyncProtocol) {
    // V8 may not optimise the fiber's body function due to the presence of
    // try/catch/finally. Therefore, the body function does as little as possible,
    // delegating all the work to the optimisable closures below.
    // Note the setImmediate in the finally clause, which ensures the finallyBlock
    // is executed in the context of the fiber's caller, after the fiber exits.
    var fi = Fiber(function fiberBody() {
        try  {
            tryBlock();
        } catch (err) {
            catchBlock(err);
        } finally {
            setImmediate(finallyBlock);
        }
    });

    // These references are shared by the closures below.
    var result, error;

    // The job of the try block is to attempt to execute the fiber's target.
    function tryBlock() {
        error = null; // Clearing this is essential since the fiber may run more than once.

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
        } else if (noThis) {
            result = f();
        } else {
            result = f.apply(t, a);
        }
    }

    // The catch block just sets the error flag, which will be used in the finally block.
    function catchBlock(err) {
        error = err;
    }

    // The finally block delegates to the async protocol to handle the error/result, then cleans up the fiber.
    function finallyBlock() {
        asyncProtocol.end(fi, error, result);
        fiberProtocol.release(asyncProtocol, fi);
    }

    // Return the newly created fiber.
    return fi;
}
module.exports = mod;
//# sourceMappingURL=baseline.js.map
