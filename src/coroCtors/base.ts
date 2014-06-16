import references = require('references');
import Fiber = require('fibers');
import semaphore = require('../semaphore');
import fiberPool = require('../fiberPool');
import Coroutine = AsyncAwait.Async.Coroutine;
export = CoroutineBase;


class CoroutineBase implements Coroutine {
    constructor(proc: Function) {
        this._proc = proc;
        this._fiber = null;
    }

    invoke(): any {
        return this;
    }

    dispose() {
    }

    return(result: any) { }

    throw(error: any) { }

    yield(value: any) { }

    _proc: Function;

    _fiber: Fiber;
}
