import references = require('references');
import assert = require('assert');
import oldBuilder = require('../src/asyncBuilder');
import _ = require('../src/util');
export = newBuilder;


/** Fiber interface extended with type information for 'context'. */
interface FiberEx extends Fiber {
    context: (error?, value?) => void;
}


var newBuilder = oldBuilder.mod({

    name: 'cps',

    type: <AsyncAwait.Async.CPSBuilder> null,

    overrideProtocol: (base, options) => ({

        begin: (fi: FiberEx, callback: AsyncAwait.Callback<any>) => {
            assert(_.isFunction(callback), 'Expected final argument to be a callback');
            fi.context = callback;
            fi.resume();
        },

        end: (fi: FiberEx, error?, value?) => {
            if (error) fi.context(error); else fi.context(null, value);
        }
    })
});
