import references = require('references');
import _ = require('../util');
export = mods;


///** TODO */
var mods = [
    {
        name: 'async.thunk',
        base: 'async.cps',
        override: overrideAsync
    },
    {
        name: 'await.thunk',
        base: 'await.cps',
        override: overrideAwait
    }
];


function overrideAsync(cps, options) {
    return {
        begin: (fi) => {
            return (callback: AsyncAwait.Callback<any>) => cps.begin(fi, callback || _.empty);
        }
    };
}


function overrideAwait(base, options) {
    return {
        singular: (fi, arg) => {
            if (!_.isFunction(arg)) return _.notHandled;
            arg(fi.resume);
        },
        variadic: (fi, args) => {
            if (!_.isFunction(args[0])) return _.notHandled;
            args[0](fi.resume);
        },

        elements: (values: any[], result: (err: Error, value: any, index: number) => void) => {

            // TODO: temp testing...
            var k = 0;
            values.forEach((value, i) => {
                if (_.isFunction(value)) {
                    var callback = (err, res) => result(err, res, i);
                    value(callback);
                    ++k;
                }
            });
            return k;
        }
    };
}
