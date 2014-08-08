import references = require('references');
import Mod = AsyncAwait.Mod;
export = fiberPool;


/** Extended async protocol interface with fiber pool info. */
interface AsyncProtocol extends AsyncAwait.Async.Protocol {
    fiberPoolId: number;
}


/** Pools fiber instances across acquire/release cycles, for improved performance. */
var fiberPool: Mod = {

    name: 'fiberPool',

    overrideProtocol: (base, options) => {

        // Override the joint protocol if the option is selected.
        return (!options.fiberPool) ? null : {

            /** Create and return a new Fiber instance. */
            acquireFiber: (asyncProtocol: AsyncProtocol) => {

                // Resolve the fiber pool associated with the async protocol.
                var fiberPoolId = asyncProtocol.fiberPoolId || (asyncProtocol.fiberPoolId = ++_nextPoolId);
                var fiberPool = _pools[fiberPoolId] || (_pools[fiberPoolId] = []);

                // If the pool is empty, create and return a new fiber via the joint protocol.
                if (fiberPool.length === 0) return base.acquireFiber(asyncProtocol);

                // Reuse a fiber from the pool, and return it.
                --_poolLevel;
                var fi = fiberPool.pop();
                fi.context = {};
                return fi;
            },

            /** Ensure the Fiber instance is disposed of cleanly. */
            releaseFiber: (asyncProtocol: AsyncProtocol, fi: Fiber) => {

                // Resolve the fiber pool associated with the async protocol.
                var fiberPoolId = asyncProtocol.fiberPoolId || (asyncProtocol.fiberPoolId = ++_nextPoolId);
                var fiberPool = _pools[fiberPoolId] || (_pools[fiberPoolId] = []);

                // If the pool is already full, release the fiber via the joint protocol.
                if (_poolLevel >= _poolLimit) return base.releaseFiber(asyncProtocol, fi);

                // Clear the fiber and add it to the pool.
                ++_poolLevel;
                base.setFiberTarget(fi, null);
                fi.context = null;
                fiberPool.push(fi);
            },

            shutdown: () => {
                _poolLevel = 0;
                _poolLimit = 100;
                _pools = [];
                base.shutdown();
            }

        };
    },

    defaultOptions: {
        fiberPool: true
    }
};


// Private fiber pool state.
//TODO: should this be global, in case multiple asyncawait instances are loaded in the process?
var _poolLevel = 0;
var _poolLimit = 100;
var _nextPoolId = 0;
var _pools: Fiber[][] = [];
