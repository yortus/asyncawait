import references = require('references');
import Mod = AsyncAwait.Mod;
export = coroPool;


/** Pools coroutine instances across acquire/release cycles, for improved performance. */
var coroPool: Mod = {

    name: 'coroPool',

    overridePipeline: (base, options) => {

        // Override the pipeline if the option is selected.
        return (!options.coroPool) ? null : {

            /** Create and return a new Coroutine instance. */
            acquireCoro: (asyncProtocol: AsyncProtocol, bodyFunc: Function, bodyThis: any, bodyArgs: any[]) => {

                // Resolve the coroutine pool associated with the protocol.
                var coroPoolId = asyncProtocol.coroPoolId || (asyncProtocol.coroPoolId = ++_nextPoolId);
                var coroPool = _pools[coroPoolId] || (_pools[coroPoolId] = []);

                // If the pool is empty, create and return a new coroutine via the pipeline.
                if (coroPool.length === 0) return base.acquireCoro(asyncProtocol, bodyFunc, bodyThis, bodyArgs);

                // Reuse a coroutine from the pool, and return it.
                --_poolLevel;
                var co = coroPool.pop();
                co.bodyFunc = bodyFunc;
                co.bodyThis = bodyThis;
                co.bodyArgs = bodyArgs;
                co.context = {};
                return co;
            },

            /** Ensure the Coroutine instance is disposed of cleanly. */
            releaseCoro: (asyncProtocol: AsyncProtocol, co: Fiber) => {

                // Resolve the coroutine pool associated with the protocol.
                var coroPoolId = asyncProtocol.coroPoolId || (asyncProtocol.coroPoolId = ++_nextPoolId);
                var coroPool = _pools[coroPoolId] || (_pools[coroPoolId] = []);

                // If the pool is already full, release the coroutine via the pipeline.
                if (_poolLevel >= _poolLimit) return base.releaseCoro(asyncProtocol, co);

                // Clear the coroutine and add it to the pool.
                ++_poolLevel;
                co.bodyFunc = null;
                co.bodyThis = null;
                co.bodyArgs = null;
                co.context = null;
                coroPool.push(co);
            }
        };
    },

    reset: () => {
        _poolLevel = 0;
        _poolLimit = 100;
        _pools = [];
    },

    defaultOptions: {
        coroPool: true
    }
};


/** Extended Protocol interface with coroutine pool. */
interface AsyncProtocol extends AsyncAwait.Async.Protocol {
    coroPoolId: number;
}


// Private coroutine pool state.
//TODO: should this be global, in case multiple asyncawait instances are loaded in the process?
var _poolLevel = 0;
var _poolLimit = 100;
var _nextPoolId = 0;
var _pools: Fiber[][] = [];
