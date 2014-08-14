import references = require('references');
import assert = require('assert');
import config = require('../config/index');
import Protocol = require('../protocol');
import _ = require('../util');
import createSuspendableFunction = require('./createSuspendableFunction');
import Builder = AsyncAwait.Async.Builder;
import AsyncMod = AsyncAwait.Async.AsyncMod;
export = asyncBuilder;


/**
 *  Provides the base-level async() function from which all suspendable functions and async mods
 *  may be built. This base-level async() function implements a simple async protocol which:
 *  - implements resume() in terms of Fiber's run() and throwInto().
 *  - implements begin() and end() to just throw, since all protocols must override these.
 *  - implements suspend() to just throw, since yield() must be explicitly supported by a protocol.
 */
var asyncBuilder = createAsyncBuilder(new Protocol(_.branch(config.options()), () => ({
    begin: (fi) => { throw new Error('begin: not implemented. All async mods must override this method.'); },
    suspend: (fi, error?, value?) => { throw new Error('suspend: not supported by this type of suspendable function'); },
    resume: (fi, error?, value?) => { return error ? fi.throwInto(error) : fi.run(value); },
    end: (fi, error?, value?) => { throw new Error('end: not implemented. All async mods must override this method.'); }
})));


/** Creates a new async builder function using the specified mod and protocol settings. */
function createAsyncBuilder(protocol: Protocol<any, any>) {

    // Create the builder function.
    var builder: Builder = <any> function asyncBuilder(invokee: Function) {

        // Validate the argument, which is expected to be a closure defining the body of the suspendable function.
        assert(arguments.length === 1, 'async builder: expected a single argument');
        assert(_.isFunction(invokee), 'async builder: expected argument to be a function');

        // Create and return an appropriately configured suspendable function for the given protocol and body.
        return createSuspendableFunction(protocol.members, invokee);
    };

    // Tack on the builder's other properties, and the mod() method.
    builder.name = null; //TODO:... implement, add all tests, use in error messages
    builder.mod = (mod: AsyncMod) => createAsyncBuilder(protocol.mod(mod));

    // Return the async builder function.
    return builder;
}
