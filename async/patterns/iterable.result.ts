import references = require('references');
import _ = require('lodash');
import Promise = require('bluebird');
import await = require('asyncawait/await');
import IterableCoro = require('./iterable');
export = IterableResultCoro;


class IterableResultCoro extends IterableCoro {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]): any {
        var iter = super.invoke(func, this_, args);
        return {
            next: () => await (iter.next()),
            forEach: callback => await (iter.forEach(callback))
        };
    }
}
