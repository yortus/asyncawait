import _refs = require('_refs');
import _ = require('lodash');
import Promise = require('bluebird');
import IterableCpsCoro = require('./iterable.cps');
export = IterableThunkCoro;


class IterableThunkCoro extends IterableCpsCoro {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]): any {
        var iter = super.invoke(func, this_, args);
        return {
            next: () => (callback) => iter.next(callback),
            forEach: callback => {

                // Ensure that a single argument has been supplied, which is a function.
                if (arguments.length !== 1) throw new Error('forEach(): expected a single argument');
                if (!_.isFunction(callback)) throw new Error('forEach(): expected argument to be a function');

                // Return a thunk
                return done => iter.forEach(callback, done);
            }
        };
    }
}
