import references = require('references');
import assert = require('assert');
import Fiber = require('./fibers');
import semaphore = require('./semaphore');
import fiberPool = require('./fiberPool');
import system = require('./system');
import Protocol = AsyncAwait.Async.Protocol;
import Coroutine = AsyncAwait.Coroutine;
export = create;


//TODO: ...
function create(protocol: Protocol, body: () => void): Coroutine {
    return system.acquireCoro(protocol, body, null, []);
}
